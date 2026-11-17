import type { AssetCollection, Collection, CmsConfig, Field } from '@sveltia/cms'
import { adminCollections, type CollectionOptions } from '@/admin/collections'
import { contractFields, hasTranslations, translate } from '@/admin/fields'
import labels from '@/admin/labels.json'
import settings from '@/admin/settings.json'
import { contentPath } from '@/content/paths'
import { defaultLocale, locales } from '@/i18n/locales'
import { slugSegmentPattern } from '@/i18n/routes'

/** Admin-only: collection shapes for Sveltia, derived from the content contract. */

function base(name: string, options: CollectionOptions) {
  return {
    name,
    label: options.label,
    ...(options.label_singular && { label_singular: options.label_singular }),
    ...(options.summary && { summary: options.summary }),
    ...(options.sortable_fields && { sortable_fields: options.sortable_fields }),
  }
}

/** `file` fields upload where the collection says downloads go (public/). */
function withFiles(list: Field[], files: CollectionOptions['files']): Field[] {
  if (!files) return list
  return list.map((field) => {
    if (field.widget === 'file') return { ...field, ...files }
    if ('fields' in field && Array.isArray(field.fields)) {
      return { ...field, fields: withFiles(field.fields, files) } as Field
    }
    return field
  })
}

/** Image uploads land in the collection's folder; Astro's image() resolves them. */
const folder = (options: CollectionOptions) =>
  options.media_folder && {
    media_folder: options.media_folder,
    public_folder: options.public_folder,
  }

/**
 * One file in src/content/. A `{{locale}}` in its path makes one file per
 * locale; otherwise translated fields share the file, keyed by locale.
 */
function fileCollection(
  name: string,
  options: CollectionOptions,
  list: Field[],
): Collection {
  if (!options.file) throw new Error(`collections.json: "${name}" needs a file path`)
  const perLocale = options.file.includes('{{locale}}')
  const fields = withFiles(perLocale ? list.map(translate) : list, options.files)
  // Sveltia wants i18n on the collection and on the file itself.
  const i18n = (perLocale || hasTranslations(fields)) && { i18n: true }
  return {
    ...base(name, options),
    ...i18n,
    files: [
      {
        name,
        label: options.label,
        ...i18n,
        file: contentPath(options.file),
        ...(options.file.endsWith('.json') && { format: 'json' as const }),
        ...folder(options),
        fields,
      },
    ],
  }
}

/**
 * One file per record. Posts keep one file per locale (the global structure);
 * a record with translatable fields keeps every locale in one file.
 */
function entryCollection(
  name: string,
  options: CollectionOptions,
  list: Field[],
): Collection {
  const extension = options.extension ?? 'yaml'
  const fields = withFiles(list, options.files)
  const i18n = options.perLocaleFiles
    ? true
    : hasTranslations(fields) && { structure: 'single_file' as const }
  return {
    ...base(name, options),
    ...(i18n && { i18n }),
    folder: contentPath(name),
    ...folder(options),
    create: true,
    extension,
    format: extension === 'mdx' ? 'frontmatter' : 'yaml',
    ...(options.slug && {
      slug: { ...options.slug, pattern: [slugSegmentPattern.source, labels.errors.slug] },
    }),
    fields,
  }
}

/** Dotted translation keys are data, not field names, so one root keyvalue holds them. */
const stringFields = (options: CollectionOptions): Field[] => [
  {
    name: 'strings',
    label: options.label,
    widget: 'keyvalue',
    required: true,
    root: true,
  },
]

/**
 * Every folder a collection uploads to appears in the media picker and the
 * asset library, next to the global one, under the collection's name.
 */
function assetCollections(): AssetCollection[] {
  return Object.entries(adminCollections).flatMap(([name, options]) => [
    ...(options.media_folder
      ? [
          {
            name,
            label: options.label,
            media_folder: options.media_folder,
            public_folder: options.public_folder,
          },
        ]
      : []),
    ...(options.files
      ? [
          {
            name: `${name}-files`,
            label: `${options.label} · ${labels.files}`,
            ...options.files,
          },
        ]
      : []),
  ])
}

export function cmsConfig(): CmsConfig {
  const collections = Object.entries(adminCollections).map(([name, options]) => {
    if (options.kind === 'strings')
      return fileCollection(name, options, stringFields(options))
    const fields = contractFields(name, {
      body: options.body,
      perLocale: options.perLocaleFiles,
    })
    return options.kind === 'entries'
      ? entryCollection(name, options, fields)
      : fileCollection(name, options, fields)
  })

  return {
    // JSON widens literals; the shape is asserted against the official schema at build time.
    backend: settings.backend as CmsConfig['backend'],
    media_folder: settings.media_folder,
    public_folder: settings.public_folder,
    asset_collections: assetCollections(),
    // Uploads are resized and converted to WebP in the browser before commit.
    media_libraries: settings.media_libraries as CmsConfig['media_libraries'],
    publish_mode: settings.publish_mode as CmsConfig['publish_mode'],
    slug: settings.slug as CmsConfig['slug'],
    output: settings.output,
    i18n: {
      structure: 'multiple_folders',
      locales: [...locales],
      default_locale: defaultLocale,
    },
    collections,
  }
}
