import { getEntry } from 'astro:content'
import { z } from 'astro/zod'
import home from '@/content/home.json'
import { fields, inLocale } from '@/content/model'
import type { Lang } from '@/i18n/locales'

const entry = await getEntry('site', 'site')
if (!entry) throw new Error('Missing src/content/site.json')
const record = entry.data

/** Site details from the CMS in one locale; Astro has resolved every image. */
export const siteFor = (lang: Lang) => inLocale(record, lang)
export type Site = ReturnType<typeof siteFor>

/** Homepage sections in editor order. */
export const sections = z.object(fields.home()).parse(home).sections
