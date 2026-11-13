import { z } from 'astro/zod'
import type cms from '@/content/cms.json'
import { defaultLocale, locales } from '@/i18n/locales'

/**
 * The content contract. This file is the only place that decides what a field
 * means: its type, requiredness, default and relationships. Astro validates
 * with it; the CMS config is derived from it. Editor text stays in cms.json.
 */

type LabelKey = keyof typeof cms.labels
type HintKey = keyof typeof cms.hints

/** What an editor needs that a Zod type cannot express. */
export type EditorMeta = {
  label?: string
  hint?: string
  media?: 'image' | 'file'
  relation?: string
  multiple?: boolean
  multiline?: boolean
}

type Presentation = EditorMeta & { label: LabelKey; hint?: HintKey }

const text = z.string().trim().min(1)

const show = <T extends z.ZodType>(schema: T, presentation: Presentation) =>
  schema.meta(presentation)

/** Text with a label; every other field follows this same shape. */
const field = (label: LabelKey, extra: Omit<Presentation, 'label'> = {}) =>
  show(text, { label, ...extra })

/** Structured text: the source locale is required, others may fall back. */
const localized = (label: LabelKey) =>
  z
    .partialRecord(z.enum(locales), z.string().trim())
    .refine((value) => Boolean(value[defaultLocale]), {
      error: `Missing ${defaultLocale} text`,
    })
    .meta({ label, required: [defaultLocale] })

/** Calendar dates only; null, booleans and bare numbers are rejected. */
const date = z
  .union([z.date(), z.iso.date(), z.iso.datetime({ offset: true })])
  .transform((value) => new Date(value))
  .meta({ label: 'date', type: 'string', format: 'date-time' } as const)

const relations = (collection: string, label: LabelKey, hint?: HintKey) =>
  show(
    z
      .array(text)
      .refine((ids) => new Set(ids).size === ids.length, {
        error: 'Duplicate ids',
      })
      .default([]),
    { label, hint, relation: collection, multiple: true },
  )

const kind = <T extends readonly [string, ...string[]]>(options: T, label: LabelKey) =>
  show(z.enum(options), { label })

export const schemas = {
  about: z.object({
    title: field('title'),
    lead: field('lead'),
    updated: show(date, { label: 'updated' }).optional(),
    credential: field('credential', { relation: 'credentials' }).optional(),
  }),
  posts: z.object({
    title: field('title'),
    description: field('description', { multiline: true }),
    date: show(date, { label: 'date' }),
    draft: show(z.boolean().default(false), { label: 'draft' }),
    tags: show(z.array(text).default([]), { label: 'tags' }),
    origin: show(
      z.object({
        label: field('label'),
        url: show(z.httpUrl(), { label: 'url' }),
      }),
      { label: 'origin' },
    ).optional(),
  }),
  facts: z.object({
    order: show(z.int(), { label: 'order' }),
    year: field('year'),
    title: localized('title'),
    summary: localized('summary'),
    metric: localized('metric').optional(),
    refs: relations('references', 'refs', 'refs'),
    credentials: relations('credentials', 'credentials', 'credentials'),
  }),
  work: z.object({
    order: show(z.int(), { label: 'order' }),
    year: field('year'),
    title: localized('title'),
    summary: localized('summary'),
    metric: localized('metric').optional(),
    tech: field('tech'),
    refs: relations('references', 'refs', 'refs'),
    cover: field('cover', { media: 'image' }).optional(),
    credentials: relations('credentials', 'credentials', 'credentials'),
  }),
  credentials: z.object({
    year: field('year'),
    title: localized('title'),
    issuer: localized('issuer'),
    file: field('file', { media: 'file' }),
    preview: field('preview', { media: 'image', hint: 'preview' }),
    extra: field('extra', { media: 'file' }).optional(),
    kind: kind(['course', 'award', 'role'], 'kind'),
  }),
  outlets: z.object({
    name: localized('name'),
    tier: show(z.int().min(1).max(3), { label: 'tier', hint: 'tier' }),
    logo: field('logo', { media: 'image' }).optional(),
  }),
  references: z.object({
    url: show(z.httpUrl(), { label: 'url' }),
    outlet: field('outlet', { hint: 'outlet', relation: 'outlets' }),
    title: field('title'),
    label: field('label').optional(),
    date: show(date, { label: 'date' }).optional(),
    kind: kind(['press', 'video', 'award', 'code', 'social'], 'kind'),
  }),
  site: z.object({
    email: show(z.email(), { label: 'email' }),
    github: show(z.httpUrl(), { label: 'github' }),
    linkedin: show(z.httpUrl(), { label: 'linkedin' }),
    location: localized('location'),
  }),
}
