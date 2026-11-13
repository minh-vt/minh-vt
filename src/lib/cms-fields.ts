import { z } from 'astro/zod'
import cms from '@/content/cms.json'
import { schemas, type EditorMeta } from '@/content/model'
import { isLang } from '@/i18n/locales'
import { languageName } from '@/i18n/utils'

/** Turns the Zod contract into editor fields; rules stay in model.ts. */

type Json = z.core.JSONSchema.JSONSchema
type Widget =
  | 'string'
  | 'text'
  | 'markdown'
  | 'object'
  | 'list'
  | 'relation'
  | 'image'
  | 'file'
  | 'datetime'
  | 'number'
  | 'boolean'
  | 'select'
  | 'keyvalue'

export interface Field {
  name: string
  label: string
  widget: Widget
  required: boolean
  hint?: string
  default?: unknown
  fields?: Field[]
  field?: Field
  options?: (string | number | boolean | null)[]
  value_type?: 'int' | 'float'
  min?: number
  max?: number
  i18n?: boolean
  collection?: string
  multiple?: boolean
  value_field?: string
  display_fields?: string[]
  search_fields?: string[]
  root?: boolean
}

type Meta = Json & EditorMeta

const collections = cms.collections as Record<string, { display_field?: string }>

/** Editor text declared in cms.json; a missing key is a build error. */
function editorText(kind: 'labels' | 'hints', key: string, owner: string): string {
  const value = (cms[kind] as Record<string, string>)[key]
  if (!value) throw new Error(`Unknown CMS ${kind} "${key}" used by field "${owner}"`)
  return value
}

/** Localized text is a record of locale keys; it needs no contract metadata. */
function objectFields(schema: Json): Field[] {
  const names = schema.propertyNames
  if (!schema.properties && typeof names === 'object' && Array.isArray(names.enum)) {
    return names.enum.map((key) => {
      if (typeof key !== 'string' || !isLang(key)) {
        throw new Error(`Unsupported CMS record key: ${String(key)}`)
      }
      return {
        name: key,
        label: languageName(key),
        widget: 'string',
        required: schema.required?.includes(key) ?? false,
      }
    })
  }
  if (!schema.properties) throw new Error('CMS object declares no properties')
  const required = schema.required ?? []
  return Object.entries(schema.properties).map(([name, child]) =>
    fieldFor(name, child as Json, required.includes(name)),
  )
}

function scalarWidget(
  schema: Json,
  multiline: boolean | undefined,
  name: string,
): Widget {
  if (schema.enum) return 'select'
  if (schema.format === 'date-time') return 'datetime'
  if (schema.type === 'integer' || schema.type === 'number') return 'number'
  if (schema.type === 'boolean') return 'boolean'
  if (schema.type === 'string') return multiline ? 'text' : 'string'
  throw new Error(`Unsupported CMS field type "${String(schema.type)}" on "${name}"`)
}

function relationField(field: Field, meta: Meta): Field {
  const target = collections[meta.relation as string]
  if (!target?.display_field) {
    throw new Error(`Unknown CMS relation target "${meta.relation}" on "${field.name}"`)
  }
  return {
    ...field,
    widget: 'relation',
    collection: meta.relation,
    multiple: meta.multiple ?? false,
    value_field: '{{slug}}',
    display_fields: [target.display_field],
    search_fields: [target.display_field],
  }
}

function listField(schema: Json, name: string): Field {
  const items = schema.items
  if (typeof items !== 'object' || Array.isArray(items) || items.type !== 'string') {
    throw new Error(`CMS list "${name}" must hold strings`)
  }
  return {
    name: 'value',
    label: editorText('labels', 'value', name),
    widget: 'string',
    required: true,
  }
}

function fieldFor(name: string, schema: Json, required: boolean): Field {
  const meta = schema as Meta
  if (!meta.label) throw new Error(`CMS field "${name}" declares no label`)
  const field: Field = {
    name,
    label: editorText('labels', meta.label, name),
    widget: 'string',
    required,
    ...(meta.hint && { hint: editorText('hints', meta.hint, name) }),
  }

  if (meta.relation) return relationField(field, meta)
  if (meta.media) return { ...field, widget: meta.media }
  if (schema.type === 'object')
    return { ...field, widget: 'object', fields: objectFields(schema) }
  if (schema.type === 'array') {
    return {
      ...field,
      widget: 'list',
      default: schema.default,
      field: listField(schema, name),
    }
  }

  const widget = scalarWidget(schema, meta.multiline, name)
  return {
    ...field,
    widget,
    default: schema.default,
    ...(widget === 'select' && { options: schema.enum }),
    ...(widget === 'number' && {
      value_type: schema.type === 'integer' ? ('int' as const) : ('float' as const),
      min: schema.minimum,
      max: schema.maximum,
    }),
  }
}

function translate(field: Field): Field {
  return {
    ...field,
    i18n: true,
    ...(field.fields && { fields: field.fields.map(translate) }),
    ...(field.field && { field: translate(field.field) }),
  }
}

/** CMS fields for one collection, including an optional prose body. */
export function contractFields(
  name: string,
  options: { body?: boolean; i18n?: boolean },
): Field[] {
  const schema = (schemas as Record<string, z.ZodType | undefined>)[name]
  if (!schema) throw new Error(`No content model for CMS collection "${name}"`)
  const fields = objectFields(
    z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }),
  )
  if (options.body) {
    fields.push({
      name: 'body',
      label: editorText('labels', 'body', name),
      widget: 'markdown',
      required: true,
    })
  }
  return options.i18n ? fields.map(translate) : fields
}
