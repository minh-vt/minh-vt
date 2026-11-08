import { z } from 'astro/zod'
import { schemas } from '@/content.config'
import metadata from '@/content/cms.json'
import { defaultLocale, isLang, locales } from '@/i18n/locales'
import { languageName } from '@/i18n/utils'
import { slugSegmentPattern } from '@/i18n/routes'

type Schema = z.core.JSONSchema.JSONSchema
interface Field {
  name: string
  label: string
  widget: string
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
}
const hints: Record<string, { label?: string; widget?: string; hint?: string }> =
  metadata.fields

function objectFields(schema: Schema, leafWidget?: string): Field[] {
  let properties = schema.properties
  const additional = schema.additionalProperties
  if (
    !properties &&
    typeof additional === 'object' &&
    typeof schema.propertyNames === 'object'
  ) {
    properties = Object.fromEntries(
      (schema.propertyNames.enum ?? []).map((key) => {
        if (typeof key !== 'string') throw new Error('CMS record keys must be strings')
        return [key, additional]
      }),
    )
  }
  if (!properties) throw new Error('Missing CMS object properties')
  return Object.entries(properties).map(([key, child]) =>
    field(key, child, schema.required?.includes(key) ?? false, leafWidget),
  )
}

const scalarTypes = new Map<string, Pick<Field, 'widget' | 'value_type'>>([
  ['string', { widget: 'string' }],
  ['integer', { widget: 'number', value_type: 'int' }],
  ['number', { widget: 'number', value_type: 'float' }],
  ['boolean', { widget: 'boolean' }],
])

function scalarField(schema: Schema, widgetHint?: string) {
  const scalar = scalarTypes.get(String(schema.type))
  if (!scalar) throw new Error(`Unsupported CMS scalar type: ${schema.type}`)
  let widget = scalar.widget
  if (schema.format === 'date-time') widget = 'datetime'
  if (widgetHint) widget = widgetHint
  if (schema.enum) widget = 'select'
  return {
    ...scalar,
    widget,
    default: schema.default,
    options: schema.enum,
    min: schema.minimum,
    max: schema.maximum,
  }
}

/** Only the schema shapes used by this site; unsupported shapes fail the build. */
function field(
  name: string,
  schema: Schema | boolean,
  required = true,
  leafWidget?: string,
): Field {
  if (typeof schema !== 'object') throw new Error(`Unsupported CMS schema: ${name}`)
  const hint = hints[name]
  const base = {
    name,
    label: isLang(name) ? languageName(name) : (hint?.label ?? name),
    required,
  }
  if (schema.type === 'object') {
    return { ...base, widget: 'object', fields: objectFields(schema, hint?.widget) }
  }
  if (schema.type === 'array' && schema.items && !Array.isArray(schema.items)) {
    return {
      ...base,
      widget: 'list',
      default: schema.default,
      hint: hint?.hint,
      field: field('value', schema.items),
    }
  }
  return { ...base, ...scalarField(schema, hint?.widget ?? leafWidget), hint: hint?.hint }
}

function translateField(item: Field): Field {
  return {
    ...item,
    i18n: true,
    ...(item.fields && { fields: item.fields.map(translateField) }),
    ...(item.field && { field: translateField(item.field) }),
  }
}

function isSchemaName(name: string): name is keyof typeof schemas {
  return Object.hasOwn(schemas, name)
}

export function GET() {
  const collections = Object.entries(metadata.collections).map(([name, options]) => {
    if (name === 'strings') {
      return {
        name,
        ...options,
        files: locales.map((locale) => ({
          name: `strings_${locale}`,
          label: languageName(locale),
          file: `src/content/strings/${locale}.json`,
          format: 'json',
          // Dotted translation keys are data, not CMS field names.
          fields: [
            { name: 'strings', label: options.label, widget: 'keyvalue', root: true },
          ],
        })),
      }
    }
    if (!isSchemaName(name))
      throw new Error(`Missing content schema for CMS collection: ${name}`)
    const fields = field(
      name,
      z.toJSONSchema(schemas[name], { io: 'input', unrepresentable: 'any' }),
    ).fields
    if (!fields) throw new Error(`CMS collection must be an object: ${name}`)
    if (name === 'about' || name === 'posts')
      fields.push(field('body', { type: 'string' }))
    if (name === 'about') {
      return {
        name,
        ...options,
        files: locales.map((locale) => ({
          name: `about_${locale}`,
          label: languageName(locale),
          file: `src/content/about/${locale}.mdx`,
          fields,
        })),
      }
    }
    if (name === 'site') {
      return {
        name,
        ...options,
        files: [
          {
            name,
            label: options.label,
            file: 'src/content/site.json',
            format: 'json',
            fields,
          },
        ],
      }
    }
    return {
      name,
      ...options,
      folder: `src/content/${name}`,
      create: true,
      extension: name === 'posts' ? 'mdx' : 'yaml',
      format: name === 'posts' ? 'frontmatter' : 'yaml',
      ...(name === 'posts' && {
        i18n: true,
        slug: {
          template: '{{slug}}',
          pattern: [slugSegmentPattern.source, metadata.errors.slug],
        },
      }),
      fields: name === 'posts' ? fields.map(translateField) : fields,
    }
  })
  return Response.json({
    ...metadata.settings,
    i18n: { structure: 'multiple_folders', locales, default_locale: defaultLocale },
    collections,
  })
}
