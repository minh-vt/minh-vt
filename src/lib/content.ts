import { getCollection, getEntry, type CollectionEntry } from 'astro:content'
import type { Lang } from '../i18n/ui'

export function entryLang(id: string): Lang {
  return id.split('/')[0] as Lang
}

export function entrySlug(id: string): string {
  return id.split('/').slice(1).join('/')
}

export async function getTimeline(lang: Lang): Promise<CollectionEntry<'timeline'>[]> {
  const entries = await getCollection('timeline', ({ id }) => id.startsWith(`${lang}/`))
  return entries.sort((a, b) => a.data.order - b.data.order)
}

export async function getPosts(lang: Lang): Promise<CollectionEntry<'posts'>[]> {
  const entries = await getCollection(
    'posts',
    ({ id, data }) => id.startsWith(`${lang}/`) && !data.draft,
  )
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())
}

export async function getAbout(lang: Lang) {
  return getEntry('about', lang)
}

export function readingMinutes(body: string | undefined): number {
  if (!body) return 1
  const words = body.trim().split(/\s+/).length
  return Math.max(1, Math.round(words / 220))
}
