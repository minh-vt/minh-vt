import { statSync } from 'node:fs'
import { isAbsolute, relative, resolve } from 'node:path'
import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { defaultLocale, isLang, type Lang } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'
import { local } from '@/i18n/utils'

// Anchored to the project root: server code is bundled, so import.meta.url moves.
const publicDir = resolve(process.cwd(), 'public')
if (statSync(publicDir, { throwIfNoEntry: false })?.isDirectory() !== true) {
  throw new Error(`Cannot find public/ from ${process.cwd()}`)
}

/**
 * Referenced files are checked on every build, not only when the content
 * cache is cold, so deleting an asset without editing its entry still fails.
 */
function publicFile(src: string, owner: string): string {
  const file = resolve(publicDir, `.${src}`)
  const missing =
    !isAbsolute(src) ||
    relative(publicDir, file).startsWith('..') ||
    statSync(file, { throwIfNoEntry: false })?.isFile() !== true
  if (missing) throw new Error(`${owner}: missing public file "${src}"`)
  return src
}

export function entryLang(id: string): Lang {
  const lang = id.split('/')[0]
  if (!isLang(lang)) throw new Error(`Unsupported locale in content id: ${id}`)
  return lang
}

/** Validates the locale/slug boundary before a public URL is built from it. */
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
    if (outlet.data.logo) publicFile(outlet.data.logo, `outlets/${outlet.id} logo`)
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

function localizeCredential(item: CollectionEntry<'credentials'>, lang: Lang) {
  return {
    ...item.data,
    id: item.id,
    title: local(item.data.title, lang),
    issuer: local(item.data.issuer, lang),
    file: publicFile(item.data.file, `credentials/${item.id} file`),
    preview: publicFile(item.data.preview, `credentials/${item.id} preview`),
    ...(item.data.extra && {
      extra: publicFile(item.data.extra, `credentials/${item.id} extra`),
    }),
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

/** Text shared by every ordered entry; relationships are added by the caller. */
function localizeText(
  data: {
    title: Partial<Record<Lang, string>>
    summary: Partial<Record<Lang, string>>
    metric?: Partial<Record<Lang, string>>
  },
  lang: Lang,
) {
  return {
    title: local(data.title, lang),
    summary: local(data.summary, lang),
    metric: data.metric ? local(data.metric, lang) : undefined,
  }
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
      ...localizeText(item.data, lang),
      refs: resolveAll(references, item.data.refs, `work/${item.id} refs`),
      credentials: resolveAll(
        credentials,
        item.data.credentials,
        `work/${item.id} credentials`,
      ),
      ...(item.data.cover && {
        cover: publicFile(item.data.cover, `work/${item.id} cover`),
      }),
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
      ...localizeText(item.data, lang),
      refs: resolveAll(references, item.data.refs, `facts/${item.id} refs`),
      credentials: resolveAll(
        credentials,
        item.data.credentials,
        `facts/${item.id} credentials`,
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
