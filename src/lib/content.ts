import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { defaultLang, type Lang } from '@/i18n/ui'

/**
 * Text in the requested language, falling back to the original.
 * "Original" is the first key in the map, so a YAML file declares its own
 * source language by putting it first, and no global default is involved.
 */
export function local(value: Record<string, string>, lang: Lang): string {
  return value[lang] ?? Object.values(value)[0] ?? ''
}

/** "vi/foo" becomes "vi". */
export function entryLang(id: string): Lang {
  return id.split('/')[0] as Lang
}

/** "vi/foo" becomes "foo". The locale never repeats in a public URL. */
export function postSlug(id: string): string {
  return id.split('/').slice(1).join('/')
}

export async function getFacts(): Promise<CollectionEntry<'facts'>[]> {
  const facts = await getCollection('facts')
  return facts.sort((a, b) => a.data.order - b.data.order)
}

export async function getReferences(): Promise<CollectionEntry<'references'>[]> {
  const references = await getCollection('references')
  const time = (ref: CollectionEntry<'references'>) =>
    ref.data.date?.valueOf() ?? Number.POSITIVE_INFINITY
  return references.sort((a, b) => time(a) - time(b))
}

export async function getReferenceIndex(): Promise<
  Map<string, CollectionEntry<'references'>>
> {
  const references = await getCollection('references')
  return new Map(references.map((ref) => [ref.id, ref]))
}

/** Resolve `refs` ids to entries, silently dropping ids with no file. */
export function resolveRefs(
  ids: string[],
  index: Map<string, CollectionEntry<'references'>>,
): CollectionEntry<'references'>[] {
  return ids.flatMap((id) => {
    const ref = index.get(id)
    return ref ? [ref] : []
  })
}

export type LocalizedPost = {
  entry: CollectionEntry<'posts'>
  /** Language the body is actually written in, which may not be the page's. */
  lang: Lang
}

/**
 * One row per piece, in the requested language when a translation exists.
 * The slug is the translation key: posts/vi/foo.mdx and posts/en/foo.mdx are
 * the same piece. An untranslated piece is shown in its original language
 * rather than hidden.
 */
export async function getPosts(lang: Lang): Promise<LocalizedPost[]> {
  const published = await getCollection('posts', ({ data }) => !data.draft)
  const chosen = new Map<string, CollectionEntry<'posts'>>()

  for (const entry of published) {
    const slug = postSlug(entry.id)
    const current = chosen.get(slug)
    if (!current || (entryLang(current.id) !== lang && entryLang(entry.id) === lang)) {
      chosen.set(slug, entry)
    }
  }

  return [...chosen.values()]
    .map((entry) => ({ entry, lang: entryLang(entry.id) }))
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf())
}

/** About text for a locale, falling back to the original when untranslated. */
export async function getAbout(lang: Lang) {
  const entry = (await getEntry('about', lang)) ?? (await getEntry('about', defaultLang))
  if (!entry) throw new Error('No about entry exists in any locale')
  return { entry, lang: entryLang(entry.id) }
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
