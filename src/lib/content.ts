import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { defaultLocale, isLang, type Lang } from '@/i18n/locales'
import { local } from '@/i18n/utils'
import { parsePostId } from '@/i18n/routes'

export function entryLang(id: string): Lang {
  const lang = id.split('/')[0]
  if (!isLang(lang)) throw new Error(`Unsupported locale in content id: ${id}`)
  return lang
}

/** Validate the locale/slug boundary before constructing public URLs. */
export function postSlug(id: string): string {
  return parsePostId(id).slug
}

function requireEntry<T extends { id: string }>(rows: T[], id: string, owner: string): T {
  const row = rows.find((item) => item.id === id)
  if (!row)
    throw new Error(
      `${owner}: unknown id "${id}". Known ids: ${rows.map((item) => item.id).join(', ')}`,
    )
  return row
}

/** Newest first, with the most authoritative outlets leading. */
export async function getReferences() {
  const [entries, outlets] = await Promise.all([
    getCollection('references'),
    getCollection('outlets'),
  ])
  return entries
    .map((entry) => ({
      ...entry,
      outlet: requireEntry(outlets, entry.data.outlet, `references/${entry.id} outlet`),
    }))
    .sort(
      (a, b) =>
        a.outlet.data.tier - b.outlet.data.tier ||
        (b.data.date?.valueOf() ?? 0) - (a.data.date?.valueOf() ?? 0),
    )
}
export type Reference = Awaited<ReturnType<typeof getReferences>>[number]

function localizeCredential(item: CollectionEntry<'credentials'>, lang: Lang) {
  return {
    ...item.data,
    id: item.id,
    title: local(item.data.title, lang),
    issuer: local(item.data.issuer, lang),
  }
}
export type CredentialRow = ReturnType<typeof localizeCredential>

export async function getCredentials(lang: Lang) {
  return (await getCollection('credentials'))
    .map((item) => localizeCredential(item, lang))
    .sort((a, b) => b.year.localeCompare(a.year) || a.title.localeCompare(b.title))
}

/** A standalone MDX preview needs one credential, not the whole collection. */
export async function getCredential(id: string, lang: Lang) {
  const item = await getEntry('credentials', id)
  if (!item) throw new Error(`Unknown credential id: ${id}`)
  return localizeCredential(item, lang)
}

export async function getWork(
  lang: Lang,
  references: Reference[],
  credentials: CredentialRow[],
) {
  return (await getCollection('work'))
    .sort((a, b) => a.data.order - b.data.order)
    .map((item) => ({
      ...item.data,
      id: item.id,
      title: local(item.data.title, lang),
      summary: local(item.data.summary, lang),
      metric: item.data.metric ? local(item.data.metric, lang) : undefined,
      refs: item.data.refs.map((id) =>
        requireEntry(references, id, `work/${item.id} refs`),
      ),
      credentials: item.data.credentials.map((id) =>
        requireEntry(credentials, id, `work/${item.id} credentials`),
      ),
    }))
}
export type WorkRow = Awaited<ReturnType<typeof getWork>>[number]

/** Facts in display order, localized and with validated relationships. */
export async function getFacts(
  lang: Lang,
  references: Reference[],
  credentials: CredentialRow[],
) {
  return (await getCollection('facts'))
    .sort((a, b) => a.data.order - b.data.order)
    .map((item) => ({
      ...item.data,
      id: item.id,
      title: local(item.data.title, lang),
      summary: local(item.data.summary, lang),
      metric: item.data.metric ? local(item.data.metric, lang) : undefined,
      refs: item.data.refs.map((id) =>
        requireEntry(references, id, `facts/${item.id} refs`),
      ),
      credentials: item.data.credentials.map((id) =>
        requireEntry(credentials, id, `facts/${item.id} credentials`),
      ),
    }))
}
export type FactRow = Awaited<ReturnType<typeof getFacts>>[number]

/** One row per slug, preferring a translation without hiding untranslated posts. */
export async function getPosts(lang: Lang) {
  const entries = await getCollection('posts')
  const chosen = new Map<string, CollectionEntry<'posts'>>()
  for (const entry of entries) {
    const slug = postSlug(entry.id)
    if (entry.data.draft) continue
    const current = chosen.get(slug)
    if (!current || (entryLang(current.id) !== lang && entryLang(entry.id) === lang)) {
      chosen.set(slug, entry)
    }
  }
  return [...chosen.values()]
    .map((entry) => ({ entry, lang: entryLang(entry.id) }))
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf())
}
export type LocalizedPost = Awaited<ReturnType<typeof getPosts>>[number]

export async function getAbout(lang: Lang) {
  const entry =
    (await getEntry('about', lang)) ?? (await getEntry('about', defaultLocale))
  if (!entry) throw new Error(`Missing about entry for source locale: ${defaultLocale}`)
  return { entry, lang: entryLang(entry.id) }
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 220))
}
