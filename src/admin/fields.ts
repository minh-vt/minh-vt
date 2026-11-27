import { z } from 'astro/zod'
import type { Field } from '@sveltia/cms'
import { adminCollections } from '@/admin/collections'
import labels from '@/admin/labels.json'
import { areas, downloadTypes, entryTags, fields, type Context } from '@/content/model'
import { defaultLocale } from '@/i18n/locales'
import type { UIKey } from '@/i18n/ui'
import { useTranslations } from '@/i18n/utils'

/**
 * Admin-only projection: the contract says what a field means, this file says
 * how Sveltia shows it. Editor text lives in labels.json.
 */

type Json = z.core.JSONSchema.JSONSchema
type Meta = Json & {
  relation?: string
  multiple?: boolean
  media?: 'image' | 'file'
  i18n?: boolean
}
type Base = {
  name: string
  label: string
  required: boolean
  hint?: string
  i18n?: boolean
}

const text = labels.labels as Record<string, string>
const hints = labels.hints as Record<string, string>
const widgets = labels.widgets as Record<string, string>

/** Fields the contract marks translatable are edited per locale; the rest once. */
function base(name: string, required: boolean, meta: Meta): Base {
  const value = text[name]
  if (!value) throw new Error(`Missing admin label for field "${name}"`)
  return {
    name,
    label: value,
    required,
    ...(hints[name] && { hint: hints[name] }),
    ...(meta.i18n && { i18n: true }),
  }
}

function objectFields(schema: Json): Field[] {
  if (!schema.properties) throw new Error('Admin object declares no properties')
  const required = schema.required ?? []
  return Object.entries(schema.properties).map(([name, child]) =>
    fieldFor(name, child as Json, required.includes(name)),
  )
}

function relationField(common: Base, meta: Meta): Field {
  const target = adminCollections[meta.relation as string]
  if (!target?.display_field) {
    throw new Error(`Unknown relation target "${meta.relation}" on "${common.name}"`)
  }
  return {
    ...common,
    widget: 'relation',
    collection: meta.relation as string,
    multiple: meta.multiple ?? false,
    value_field: '{{slug}}',
    display_fields: [target.display_field],
    search_fields: [target.display_field],
  }
}

/** A download field offers only the types the contract accepts. */
const accept = downloadTypes.map((type) => `.${type}`).join(',')

function fieldFor(name: string, schema: Json, required: boolean): Field {
  const meta = schema as Meta
  const common = base(name, required, meta)

  if (meta.relation) return relationField(common, meta)
  if (meta.media === 'image') return { ...common, widget: 'image' }
  if (meta.media === 'file') return { ...common, widget: 'file', accept }
  if (schema.type === 'object') {
    return { ...common, widget: 'object', fields: objectFields(schema) }
  }
  if (schema.type === 'array') return listField(common, schema)
  return scalarField(common, schema, name)
}

const types = (labels as { types?: Record<string, string> }).types ?? {}
const optionLabels = (labels as { options?: Record<string, string> }).options ?? {}

/**
 * Timeline tags and menu areas already have names on the site (`tag.*`,
 * `area.*.title` in the UI strings); the editor sees the same words.
 * labels.json `options` names every other value.
 */
const t = useTranslations(defaultLocale)
function siteName(value: string) {
  if ((entryTags as readonly string[]).includes(value)) return t(`tag.${value}` as UIKey)
  if ((areas as readonly string[]).includes(value))
    return t(`area.${value}.title` as UIKey)
  return undefined
}

/** Select options keep their stored value and show the editor's word for it. */
const selectOptions = (values: unknown[]) =>
  (values as string[]).map((value) => ({
    label: siteName(value) ?? optionLabels[value] ?? value,
    value,
  }))

/** A discriminated union becomes Sveltia's variable types, keyed by `type`. */
function variableTypes(options: Json[]) {
  return options.map((option) => {
    const name = (option.properties?.type as Json | undefined)?.const
    if (typeof name !== 'string') throw new Error('Admin union option without a type')
    const label = types[name]
    if (!label) throw new Error(`Missing admin label for section type "${name}"`)
    const { type: _discriminator, ...rest } = option.properties ?? {}
    void _discriminator
    const required = (option.required ?? []).filter((key) => key !== 'type')
    return {
      name,
      label,
      widget: 'object' as const,
      fields: Object.entries(rest).map(([key, child]) =>
        fieldFor(key, child as Json, required.includes(key)),
      ),
    }
  })
}

function listField(common: Base, schema: Json): Field {
  const items = schema.items
  if (typeof items !== 'object' || Array.isArray(items)) {
    throw new Error(`Admin list "${common.name}" has no item schema`)
  }
  const item = items as Meta
  const defaults = { default: schema.default as [] | undefined }
  if (item.oneOf || item.anyOf) {
    return {
      ...common,
      widget: 'list',
      types: variableTypes((item.oneOf ?? item.anyOf) as Json[]),
    }
  }
  if (item.type === 'object') {
    return { ...common, ...defaults, widget: 'list', fields: objectFields(item) }
  }
  if (item.media === 'image') {
    return { ...common, widget: 'image', multiple: true }
  }
  if (item.type === 'string' && item.enum) {
    return {
      ...common,
      ...defaults,
      widget: 'select',
      multiple: true,
      options: selectOptions(item.enum),
    }
  }
  if (item.type === 'string') {
    return {
      ...common,
      ...defaults,
      widget: 'list',
      field: { name: 'value', label: text.value, widget: 'string', required: true },
    }
  }
  throw new Error(`Unsupported admin list "${common.name}"`)
}

function scalarField(common: Base, schema: Json, name: string): Field {
  if (schema.enum) {
    return {
      ...common,
      widget: 'select',
      options: selectOptions(schema.enum),
      default: schema.default as string | undefined,
    }
  }
  if (schema.format === 'date-time') return { ...common, widget: 'datetime' }
  if (schema.type === 'integer' || schema.type === 'number') {
    return {
      ...common,
      widget: 'number',
      value_type: schema.type === 'integer' ? 'int' : 'float',
      min: schema.minimum,
      max: schema.maximum,
      default: schema.default as number | undefined,
    }
  }
  if (schema.type === 'boolean') {
    return {
      ...common,
      widget: 'boolean',
      default: schema.default as boolean | undefined,
    }
  }
  if (schema.type === 'string') {
    const value = schema.default as string | undefined
    return widgets[name] === 'text'
      ? { ...common, widget: 'text', default: value }
      : { ...common, widget: 'string', default: value }
  }
  throw new Error(`Unsupported admin field type "${String(schema.type)}" on "${name}"`)
}

export function translate(field: Field): Field {
  if (field.widget === 'object' && 'fields' in field) {
    return { ...field, i18n: true, fields: field.fields.map(translate) }
  }
  if (field.widget === 'list' && 'field' in field) {
    return { ...field, i18n: true, field: translate(field.field) }
  }
  return { ...field, i18n: true }
}

/** In the admin, file fields are paths the CMS writes; the build checks them. */
const admin: Context = {
  image: () => z.string().meta({ media: 'image' }),
  // The CMS writes the path itself; folders come from collections.json.
  download: () => z.string(),
}

/** Admin fields for one collection, plus an optional prose body. */
export function contractFields(
  name: string,
  options: { body?: boolean; perLocale?: boolean },
): Field[] {
  const shape = (
    fields as Record<string, ((context: Context) => z.ZodRawShape) | undefined>
  )[name]
  if (!shape) throw new Error(`No content model for admin collection "${name}"`)
  const result = objectFields(
    z.toJSONSchema(z.object(shape(admin)), { io: 'input', unrepresentable: 'any' }),
  )
  if (options.body) {
    result.push({ name: 'body', label: text.body, widget: 'markdown', required: true })
  }
  // One file per locale: every field belongs to that locale's file.
  return options.perLocale ? result.map(translate) : result
}

/** Whether any field is edited per locale (the record holds every locale). */
export const hasTranslations = (list: Field[]): boolean =>
  list.some(
    (field) =>
      field.i18n === true ||
      ('fields' in field && Array.isArray(field.fields) && hasTranslations(field.fields)),
  )
