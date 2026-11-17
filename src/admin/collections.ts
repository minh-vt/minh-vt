import raw from '@/admin/collections.json'

/** Where a field's uploads go, in Sveltia's own terms. */
interface Folder {
  /**
   * From the repository root. Sveltia reads a collection or field folder that
   * starts with `/` from the repository root (otherwise from the entry); the
   * global one in settings.json is written without the slash.
   * https://sveltiacms.app/en/docs/media/internal
   */
  media_folder: string
  /** What the CMS writes into content: an `@/` alias for images, which Astro's
      image() resolves; a site path for files served from public/. */
  public_folder: string
}

/**
 * How each collection appears in the CMS; its fields come from the contract.
 * Everything here is Sveltia vocabulary, passed through as it is.
 */
export interface CollectionOptions extends Partial<Folder> {
  label: string
  label_singular?: string
  /** `entries`: one file per record. `file`: one file (`{{locale}}` makes one per locale).
      `strings`: like `file`, holding dotted UI keys. */
  kind: 'entries' | 'file' | 'strings'
  /** For `file` and `strings`, the path inside src/content/. */
  file?: string
  summary?: string
  sortable_fields?: string[]
  /** Posts: each locale is its own file (the global multiple_folders structure). */
  perLocaleFiles?: boolean
  slug?: { template: string }
  body?: boolean
  extension?: 'mdx'
  display_field?: string
  /** Where `file` fields upload (downloads live in public/); images use media_folder. */
  files?: Folder
}

export const adminCollections = raw as Record<string, CollectionOptions>
