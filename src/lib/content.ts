import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { defaultLang, type Lang } from '../i18n/ui'

/** Pick a language from a localised map, falling back to the default locale. */
export function local(value: Record<string, string>, lang: Lang): string {
  return value[lang] ?? value[defaultLang] ?? ''
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

/** Resolve fact.refs ids to reference entries, silently dropping dead ids. */
export function resolveRefs(
  ids: string[],
  index: Map<string, CollectionEntry<'references'>>,
): CollectionEntry<'references'>[] {
  return ids.flatMap((id) => {
    const ref = index.get(id)
    return ref ? [ref] : []
  })
}

/** "vi/foo" becomes "foo". Locale never appears in a public URL segment twice. */
export function postSlug(id: string): string {
  return id.split('/').slice(1).join('/')
}

export async function getPosts(lang: Lang): Promise<CollectionEntry<'posts'>[]> {
  const posts = await getCollection(
    'posts',
    ({ id, data }) => id.startsWith(`${lang}/`) && !data.draft,
  )
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAbout(lang: Lang) {
  return getEntry('about', lang)
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
