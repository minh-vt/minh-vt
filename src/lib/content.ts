import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { inLocale, type Translated } from '@/content/model'
import { defaultLocale, isLang, type Lang } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'
import { pathFor } from '@/i18n/utils'

export function entryLang(id: string): Lang {
  const lang = id.split('/')[0]
  if (!isLang(lang)) throw new Error(`Unsupported locale in content id: ${id}`)
  return lang
}

/** Validates the locale/slug boundary before a public URL is built from it. */
export function postSlug(id: string): string {
  return parsePostId(id).slug
}

/**
 * A post has a page only in the language it is written in; every list links
 * there, so an untranslated post is one URL, never a copy under each locale.
 */
export function postPath(id: string): string {
  return pathFor(entryLang(id), `blog/${postSlug(id)}`)
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

/** A translated collection in one locale, each row with its id. */
const inLocaleRows = <T>(items: { id: string; data: Translated<T> }[], lang: Lang) =>
  items.map((item) => ({ id: item.id, ...inLocale(item.data, lang) }))

/** Newest first, with the most authoritative outlets leading. */
export async function getReferences(lang: Lang) {
  const [references, outlets] = await Promise.all([
    getCollection('references').then((items) => inLocaleRows(items, lang)),
    getCollection('outlets').then((items) => inLocaleRows(items, lang)),
  ])
  return references
    .map((row) => ({
      ...row,
      outlet: requireEntry(outlets, row.outlet, `references/${row.id} outlet`),
    }))
    .sort(
      (a, b) =>
        a.outlet.tier - b.outlet.tier ||
        (b.date?.valueOf() ?? 0) - (a.date?.valueOf() ?? 0),
    )
}
export type Reference = Awaited<ReturnType<typeof getReferences>>[number]

/** Coverage written by others: articles and award announcements. */
export function pressOf(references: Reference[]) {
  return references.filter((row) => row.kind === 'press' || row.kind === 'award')
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

export async function getCredentials(lang: Lang) {
  return inLocaleRows(await getCollection('credentials'), lang).sort(
    (a, b) => b.year.localeCompare(a.year) || a.title.localeCompare(b.title),
  )
}
export type CredentialRow = Awaited<ReturnType<typeof getCredentials>>[number]

/** Timeline rows in display order, localized, with relationships resolved. */
export async function getEntries(
  lang: Lang,
  references: Reference[],
  credentials: CredentialRow[],
) {
  return inLocaleRows(await getCollection('entries'), lang)
    .sort((a, b) => a.order - b.order)
    .map((row) => ({
      ...row,
      refs: resolveAll(references, row.refs, `entries/${row.id} refs`),
      credentials: resolveAll(
        credentials,
        row.credentials,
        `entries/${row.id} credentials`,
      ),
    }))
}
export type EntryRow = Awaited<ReturnType<typeof getEntries>>[number]

/** Roles without an end date, in editor order. */
export async function getCurrentRoles(lang: Lang) {
  return inLocaleRows(await getCollection('roles'), lang)
    .filter((row) => !row.end)
    .sort((a, b) => a.order - b.order)
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
