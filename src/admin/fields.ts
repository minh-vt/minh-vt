import { z } from 'astro/zod'
import type { Field } from '@sveltia/cms'
import adminCollections from '@/admin/collections.json'
import labels from '@/admin/labels.json'
import { schemas } from '@/content/model'
import { isLang } from '@/i18n/locales'
import { languageName } from '@/i18n/utils'

/**
 * Admin-only projection: the contract says what a field means, this file says
 * how Sveltia shows it. Editor text lives in labels.json.
 */

type Json = z.core.JSONSchema.JSONSchema
type Meta = Json & { relation?: string; multiple?: boolean; media?: 'image' | 'file' }
type Base = { name: string; label: string; required: boolean; hint?: string }

const collectionOptions = adminCollections as Record<string, { display_field?: string }>
const text = labels.labels as Record<string, string>
const hints = labels.hints as Record<string, string>
const widgets = labels.widgets as Record<string, string>

function base(name: string, required: boolean): Base {
  const value = text[name]
  if (!value) throw new Error(`Missing admin label for field "${name}"`)
  return { name, label: value, required, ...(hints[name] && { hint: hints[name] }) }
}

/** Localized text is a locale record; its subfields are languages, not fields. */
function objectFields(schema: Json): Field[] {
  const names = schema.propertyNames
  if (!schema.properties && typeof names === 'object' && Array.isArray(names.enum)) {
    return names.enum.map((key) => {
      if (typeof key !== 'string' || !isLang(key)) {
        throw new Error(`Unsupported admin record key: ${String(key)}`)
      }
      return {
        name: key,
        label: languageName(key),
        widget: 'string',
        required: schema.required?.includes(key) ?? false,
      }
    })
  }
  if (!schema.properties) throw new Error('Admin object declares no properties')
  const required = schema.required ?? []
  return Object.entries(schema.properties).map(([name, child]) =>
    fieldFor(name, child as Json, required.includes(name)),
  )
}

function relationField(common: Base, meta: Meta): Field {
  const target = collectionOptions[meta.relation as string]
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

function fieldFor(name: string, schema: Json, required: boolean): Field {
  const meta = schema as Meta
  const common = base(name, required)

  if (meta.relation) return relationField(common, meta)
  if (meta.media === 'image') return { ...common, widget: 'image' }
  if (meta.media === 'file') return { ...common, widget: 'file' }
  if (schema.type === 'object') {
    return { ...common, widget: 'object', fields: objectFields(schema) }
  }
  if (schema.type === 'array') {
    const items = schema.items
    if (typeof items !== 'object' || Array.isArray(items) || items.type !== 'string') {
      throw new Error(`Admin list "${name}" must hold strings`)
    }
    return {
      ...common,
      widget: 'list',
      default: schema.default as string[] | undefined,
      field: { name: 'value', label: text.value, widget: 'string', required: true },
    }
  }
  return scalarField(common, schema, name)
}

function scalarField(common: Base, schema: Json, name: string): Field {
  if (schema.enum) {
    return {
      ...common,
      widget: 'select',
      options: schema.enum as string[],
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

function translate(field: Field): Field {
  if (field.widget === 'object' && 'fields' in field) {
    return { ...field, i18n: true, fields: field.fields.map(translate) }
  }
  if (field.widget === 'list' && 'field' in field) {
    return { ...field, i18n: true, field: translate(field.field) }
  }
  return { ...field, i18n: true }
}

/** Admin fields for one collection, plus an optional prose body. */
export function contractFields(
  name: string,
  options: { body?: boolean; i18n?: boolean },
): Field[] {
  const schema = (schemas as Record<string, z.ZodType | undefined>)[name]
  if (!schema) throw new Error(`No content model for admin collection "${name}"`)
  const fields = objectFields(
    z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }),
  )
  if (options.body) {
    fields.push({ name: 'body', label: text.body, widget: 'markdown', required: true })
  }
  return options.i18n ? fields.map(translate) : fields
}
