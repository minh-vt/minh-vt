import { z } from 'astro/zod'
import { defaultLocale, locales } from '@/i18n/locales'

/**
 * The content contract: what a field means, never how an editor shows it.
 * Astro validates with this; the admin adapter reads it. No admin vocabulary
 * and no editor text belong here.
 */

/** Field facts the editor must know because the data model owns them. */
export type FieldMeta = {
  /** Collection this id points at. */
  relation?: string
  multiple?: boolean
  /** Referenced public file kind. */
  media?: 'image' | 'file'
}

const text = z.string().trim().min(1)

const show = <T extends z.ZodType>(schema: T, meta: FieldMeta) => schema.meta(meta)

/** Structured text: the source locale is required, others may fall back. */
const localized = () =>
  z
    .partialRecord(z.enum(locales), z.string().trim())
    .refine((value) => Boolean(value[defaultLocale]), {
      error: `Missing ${defaultLocale} text`,
    })
    .meta({ required: [defaultLocale] })

/** Calendar dates only; null, booleans and bare numbers are rejected. */
const date = z
  .union([z.date(), z.iso.date(), z.iso.datetime({ offset: true })])
  .transform((value) => new Date(value))
  .meta({ type: 'string', format: 'date-time' } as const)

const relations = (collection: string) =>
  show(
    z
      .array(text)
      .refine((ids) => new Set(ids).size === ids.length, {
        error: 'Duplicate ids',
      })
      .default([]),
    { relation: collection, multiple: true },
  )

const media = (kind: 'image' | 'file') => show(text, { media: kind })

export const schemas = {
  about: z.object({
    title: text,
    lead: text,
    updated: date.optional(),
    credential: show(text, { relation: 'credentials' }).optional(),
  }),
  posts: z.object({
    title: text,
    description: text,
    date,
    draft: z.boolean().default(false),
    tags: z.array(text).default([]),
    origin: z.object({ label: text, url: z.httpUrl() }).optional(),
  }),
  facts: z.object({
    order: z.int(),
    year: text,
    title: localized(),
    summary: localized(),
    metric: localized().optional(),
    refs: relations('references'),
    credentials: relations('credentials'),
  }),
  work: z.object({
    order: z.int(),
    year: text,
    title: localized(),
    summary: localized(),
    metric: localized().optional(),
    tech: text,
    refs: relations('references'),
    cover: media('image').optional(),
    credentials: relations('credentials'),
  }),
  credentials: z.object({
    year: text,
    title: localized(),
    issuer: localized(),
    file: media('file'),
    preview: media('image'),
    extra: media('file').optional(),
    kind: z.enum(['course', 'award', 'role']),
  }),
  outlets: z.object({
    name: localized(),
    tier: z.int().min(1).max(3),
    logo: media('image').optional(),
  }),
  references: z.object({
    url: z.httpUrl(),
    outlet: show(text, { relation: 'outlets' }),
    title: text,
    label: text.optional(),
    date: date.optional(),
    kind: z.enum(['press', 'video', 'award', 'code', 'social']),
  }),
  site: z.object({
    email: z.email(),
    github: z.httpUrl(),
    linkedin: z.httpUrl(),
    location: localized(),
  }),
}
