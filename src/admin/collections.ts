import raw from '@/admin/collections.json'
import { defaultLocale } from '@/i18n/locales'

/** How each collection appears in the CMS; field shapes come from the contract. */
export interface CollectionOptions {
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

/**
 * collections.json writes `$source` where a summary or display field reads the
 * source-locale text (`title.$source`), so changing the default locale cannot
 * leave the CMS showing an empty column.
 */
export const adminCollections = JSON.parse(
  JSON.stringify(raw).replaceAll('$source', defaultLocale),
) as Record<string, CollectionOptions>
