import cms from '@/content/cms.json'
import { contractFields, type Field } from '@/lib/cms-fields'
import { defaultLocale, locales } from '@/i18n/locales'
import { slugSegmentPattern } from '@/i18n/routes'
import { languageName } from '@/i18n/utils'

/** Collection shapes for Sveltia. Field rules live in model.ts, labels in cms.json. */

interface CollectionOptions {
  label: string
  label_singular?: string
  kind: 'perLocaleFiles' | 'entries' | 'strings' | 'single'
  summary?: string
  sortable_fields?: string[]
  i18n?: boolean
  slug?: { template: string }
  body?: boolean
  extension?: 'mdx'
  display_field?: string
}

const collections = cms.collections as Record<string, CollectionOptions>

function base(name: string, options: CollectionOptions) {
  return {
    name,
    label: options.label,
    ...(options.label_singular && { label_singular: options.label_singular }),
    ...(options.summary && { summary: options.summary }),
    ...(options.sortable_fields && { sortable_fields: options.sortable_fields }),
  }
}

/** File collections differ only in path and format. */
function filesCollection(name: string, options: CollectionOptions, fields: Field[]) {
  if (options.kind === 'single') {
    return {
      ...base(name, options),
      files: [
        {
          name,
          label: options.label,
          file: `src/content/${name}.json`,
          format: 'json',
          fields,
        },
      ],
    }
  }
  const strings = options.kind === 'strings'
  return {
    ...base(name, options),
    files: locales.map((locale) => ({
      name: `${name}_${locale}`,
      label: languageName(locale),
      file: strings
        ? `src/content/strings/${locale}.json`
        : `src/content/${name}/${locale}.mdx`,
      ...(strings && { format: 'json' }),
      fields,
    })),
  }
}

function entryCollection(name: string, options: CollectionOptions, fields: Field[]) {
  const extension = options.extension ?? 'yaml'
  return {
    ...base(name, options),
    ...(options.i18n && { i18n: true }),
    folder: `src/content/${name}`,
    create: true,
    extension,
    format: extension === 'mdx' ? 'frontmatter' : 'yaml',
    ...(options.slug && {
      slug: { ...options.slug, pattern: [slugSegmentPattern.source, cms.errors.slug] },
    }),
    fields,
  }
}

/** Dotted translation keys are data, not field names, so one root keyvalue holds them. */
function stringFields(options: CollectionOptions): Field[] {
  return [
    {
      name: 'strings',
      label: options.label,
      widget: 'keyvalue',
      required: true,
      root: true,
    },
  ]
}

export function cmsConfig() {
  const built = Object.entries(collections).map(([name, options]) => {
    if (options.kind === 'entries') {
      return entryCollection(name, options, contractFields(name, options))
    }
    if (options.kind === 'strings') {
      return filesCollection(name, options, stringFields(options))
    }
    return filesCollection(name, options, contractFields(name, options))
  })

  return {
    ...cms.settings,
    i18n: { structure: 'multiple_folders', locales, default_locale: defaultLocale },
    collections: built,
  }
}
