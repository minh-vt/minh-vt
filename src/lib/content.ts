import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import { defaultLocale, type Lang } from '@/i18n/ui'

/**
 * Text in the requested language, falling back to the original.
 * "Original" is the first key in the map, so a YAML file declares its own
 * source language by putting it first.
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

export type Outlet = CollectionEntry<'outlets'>

/**
 * Outlet ids are validated on read rather than by the schema, because Zod
 * cannot see another collection. A typo therefore fails the build with the list
 * of known ids instead of shipping "Dan Tri" next to "Dân Trí".
 */
export async function getOutletIndex(): Promise<Map<string, Outlet>> {
  const outlets = await getCollection('outlets')
  return new Map(outlets.map((outlet) => [outlet.id, outlet]))
}

export type Reference = {
  entry: CollectionEntry<'references'>
  outlet: Outlet
}

function withOutlet(
  entries: CollectionEntry<'references'>[],
  index: Map<string, Outlet>,
): Reference[] {
  const unknown = entries.filter((entry) => !index.has(entry.data.outlet))
  if (unknown.length > 0) {
    const known = [...index.keys()].join(', ')
    const detail = unknown
      .map((entry) => `${entry.id} -> "${entry.data.outlet}"`)
      .join('; ')
    throw new Error(`Unknown outlet id in references: ${detail}. Known ids: ${known}`)
  }
  return entries.map((entry) => ({ entry, outlet: index.get(entry.data.outlet)! }))
}

/** Newest first, with the most authoritative outlets leading. */
export async function getReferences(): Promise<Reference[]> {
  const [index, entries] = await Promise.all([
    getOutletIndex(),
    getCollection('references'),
  ])
  const rows = withOutlet(entries, index)
  return rows.sort((a, b) => {
    const tier = a.outlet.data.tier - b.outlet.data.tier
    if (tier !== 0) return tier
    return (b.entry.data.date?.valueOf() ?? 0) - (a.entry.data.date?.valueOf() ?? 0)
  })
}

/** Resolve `refs` ids to references, silently dropping ids with no file. */
export function resolveRefs(ids: string[], rows: Reference[]): Reference[] {
  const byId = new Map(rows.map((row) => [row.entry.id, row]))
  return ids.flatMap((id) => {
    const row = byId.get(id)
    return row ? [row] : []
  })
}

export type WorkRow = {
  id: string
  year: string
  title: string
  summary: string
  metric?: string
  tech: string
  refs: Reference[]
  cover?: string
}

export async function getWork(lang: Lang): Promise<WorkRow[]> {
  const [items, references] = await Promise.all([getCollection('work'), getReferences()])
  return items
    .sort((a, b) => a.data.order - b.data.order)
    .map((item) => ({
      id: item.id,
      year: item.data.year,
      title: local(item.data.title, lang),
      summary: local(item.data.summary, lang),
      metric: item.data.metric ? local(item.data.metric, lang) : undefined,
      tech: item.data.tech,
      refs: resolveRefs(item.data.refs, references),
      cover: item.data.cover,
    }))
}

export type CredentialRow = {
  id: string
  year: string
  title: string
  issuer: string
  logo?: string
  file: string
  extra?: string
  kind: 'course' | 'award' | 'role'
}

export async function getCredentials(lang: Lang): Promise<CredentialRow[]> {
  const [items, outlets] = await Promise.all([
    getCollection('credentials'),
    getOutletIndex(),
  ])
  const missing = items.filter(
    (item) => item.data.issuerId && !outlets.has(item.data.issuerId),
  )
  if (missing.length > 0) {
    throw new Error(
      `Unknown issuerId in credentials: ${missing.map((m) => `${m.id} -> "${m.data.issuerId}"`).join('; ')}`,
    )
  }
  return items
    .map((item) => ({
      id: item.id,
      year: item.data.year,
      title: local(item.data.title, lang),
      issuer: local(item.data.issuer, lang),
      logo: item.data.issuerId ? outlets.get(item.data.issuerId)?.data.logo : undefined,
      file: item.data.file,
      extra: item.data.extra,
      kind: item.data.kind,
    }))
    .sort((a, b) => b.year.localeCompare(a.year) || a.title.localeCompare(b.title))
}

export type LocalizedPost = {
  entry: CollectionEntry<'posts'>
  /** Language the body is actually written in. */
  lang: Lang
}

/**
 * One row per piece, in the requested language when a translation exists.
 * The slug is the translation key. An untranslated piece is shown in its
 * original language rather than hidden.
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
  const entry =
    (await getEntry('about', lang)) ?? (await getEntry('about', defaultLocale))
  if (!entry) throw new Error('No about entry exists in any locale')
  return { entry, lang: entryLang(entry.id) }
}

/** Route params for every post, for one locale. */
export async function getPostPaths(lang: Lang) {
  return (await getPosts(lang)).map((post) => ({
    params: { slug: postSlug(post.entry.id) },
    props: { post },
  }))
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}

export type FactRow = {
  id: string
  year: string
  title: string
  summary: string
  metric?: string
  refs: Reference[]
}

/** Facts in display order, localised and with their references attached. */
export function toFactRows(
  facts: CollectionEntry<'facts'>[],
  references: Reference[],
  lang: Lang,
): FactRow[] {
  return facts.map((fact) => ({
    id: fact.id,
    year: fact.data.year,
    title: local(fact.data.title, lang),
    summary: local(fact.data.summary, lang),
    metric: fact.data.metric ? local(fact.data.metric, lang) : undefined,
    refs: resolveRefs(fact.data.refs, references),
  }))
}
