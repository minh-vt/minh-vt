import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { defaultLocale, isLang, type Lang } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'
import { local, pathFor } from '@/i18n/utils'
import { siteFile, siteImage } from '@/lib/assets'

export function entryLang(id: string): Lang {
  const lang = id.split('/')[0]
  if (!isLang(lang)) throw new Error(`Unsupported locale in content id: ${id}`)
  return lang
}

/** Validates the locale/slug boundary before a public URL is built from it. */
export function postSlug(id: string): string {
  return parsePostId(id).slug
}

/** The post's URL in the reader's locale, whatever language it is written in. */
export function postPath(lang: Lang, id: string): string {
  return pathFor(lang, `blog/${postSlug(id)}`)
}

function requireEntry<T extends { id: string }>(rows: T[], id: string, owner: string): T {
  const row = rows.find((item) => item.id === id)
  if (!row)
    throw new Error(
      `${owner}: unknown id "${id}". Known ids: ${rows.map((item) => item.id).join(', ')}`,
    )
  return row
}

function resolveAll<T extends { id: string }>(
  rows: T[],
  ids: string[],
  owner: string,
): T[] {
  return ids.map((id) => requireEntry(rows, id, owner))
}

/** Newest first, with the most authoritative outlets leading. */
export async function getReferences() {
  const [entries, outlets] = await Promise.all([
    getCollection('references'),
    getCollection('outlets'),
  ])
  for (const outlet of outlets) {
    if (outlet.data.logo) siteImage(outlet.data.logo, `outlets/${outlet.id} logo`)
  }
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

/** Coverage written by others: articles and award announcements. */
export function pressOf(references: Reference[]) {
  return references.filter(
    (row) => row.data.kind === 'press' || row.data.kind === 'award',
  )
}

/**
 * What a homepage section shows: the items an editor marked as featured, in
 * collection order, or the first items when nothing is marked.
 */
export function pickFeatured<T>(
  items: T[],
  limit: number,
  isFeatured: (item: T) => boolean,
) {
  const marked = items.filter(isFeatured)
  return (marked.length > 0 ? marked : items).slice(0, limit)
}

function localizeCredential(item: CollectionEntry<'credentials'>, lang: Lang) {
  return {
    ...item.data,
    id: item.id,
    title: local(item.data.title, lang),
    issuer: local(item.data.issuer, lang),
    file: siteFile(item.data.file, `credentials/${item.id} file`),
    preview: siteImage(item.data.preview, `credentials/${item.id} preview`),
    ...(item.data.extra && {
      extra: siteFile(item.data.extra, `credentials/${item.id} extra`),
    }),
  }
}
export type CredentialRow = ReturnType<typeof localizeCredential>

export async function getCredentials(lang: Lang) {
  return (await getCollection('credentials'))
    .map((item) => localizeCredential(item, lang))
    .sort((a, b) => b.year.localeCompare(a.year) || a.title.localeCompare(b.title))
}

/** Timeline rows in display order, localized, with relationships resolved. */
export async function getEntries(
  lang: Lang,
  references: Reference[],
  credentials: CredentialRow[],
) {
  return (await getCollection('entries'))
    .sort((a, b) => a.data.order - b.data.order)
    .map((item) => ({
      ...item.data,
      id: item.id,
      title: local(item.data.title, lang),
      summary: local(item.data.summary, lang),
      detail: item.data.detail ? local(item.data.detail, lang) : undefined,
      photos: item.data.photos.map((src) => siteImage(src, `entries/${item.id} photos`)),
      refs: resolveAll(references, item.data.refs, `entries/${item.id} refs`),
      credentials: resolveAll(
        credentials,
        item.data.credentials,
        `entries/${item.id} credentials`,
      ),
    }))
}
export type EntryRow = Awaited<ReturnType<typeof getEntries>>[number]

/** Roles without an end date, in editor order. */
export async function getCurrentRoles(lang: Lang) {
  return (await getCollection('roles'))
    .filter((item) => !item.data.end)
    .sort((a, b) => a.data.order - b.data.order)
    .map((item) => ({
      id: item.id,
      role: local(item.data.role, lang),
      org: local(item.data.org, lang),
      url: item.data.url,
      start: item.data.start,
    }))
}
export type RoleRow = Awaited<ReturnType<typeof getCurrentRoles>>[number]

/**
 * One row per slug, preferring a translation without hiding untranslated posts.
 * `languages` lists every locale the post is written in.
 */
export async function getPosts(lang: Lang) {
  const entries = await getCollection('posts')
  const chosen = new Map<string, CollectionEntry<'posts'>>()
  const languages = new Map<string, Lang[]>()
  for (const entry of entries) {
    const slug = postSlug(entry.id)
    if (entry.data.draft) continue
    languages.set(slug, [...(languages.get(slug) ?? []), entryLang(entry.id)])
    const current = chosen.get(slug)
    if (!current || (entryLang(current.id) !== lang && entryLang(entry.id) === lang)) {
      chosen.set(slug, entry)
    }
  }
  return [...chosen.values()]
    .map((entry) => ({
      entry,
      lang: entryLang(entry.id),
      languages: languages.get(postSlug(entry.id)) ?? [],
    }))
    .sort((a, b) => b.entry.data.date.valueOf() - a.entry.data.date.valueOf())
}
export type LocalizedPost = Awaited<ReturnType<typeof getPosts>>[number]

export async function getAbout(lang: Lang) {
  const entry =
    (await getEntry('about', lang)) ?? (await getEntry('about', defaultLocale))
  if (!entry) throw new Error(`Missing about entry for source locale: ${defaultLocale}`)
  return { entry, lang: entryLang(entry.id) }
}

/** Neighbours within a series by part, otherwise by date. */
export function neighbours(posts: LocalizedPost[], slug: string) {
  const current = posts.find((post) => postSlug(post.entry.id) === slug)
  if (!current) return {}
  const series = current.entry.data.series
  const pool = series
    ? posts
        .filter((post) => post.entry.data.series?.id === series.id)
        .sort(
          (a, b) => (a.entry.data.series?.part ?? 0) - (b.entry.data.series?.part ?? 0),
        )
    : [...posts].sort((a, b) => a.entry.data.date.valueOf() - b.entry.data.date.valueOf())
  const index = pool.indexOf(current)
  return { previous: pool[index - 1], next: pool[index + 1] }
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1
  return Math.max(1, Math.round(body.trim().split(/\s+/).length / 220))
}
