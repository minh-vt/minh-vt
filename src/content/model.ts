import { z } from 'astro/zod'
import { assetPath, type AssetGroup } from '@/content/paths'
import { defaultLocale, locales } from '@/i18n/locales'

/**
 * The content contract: what a field means, never how an editor shows it.
 * Astro validates with this; the admin adapter reads it. No admin vocabulary
 * and no editor text belong here.
 */

/** Field facts the editor must know because the data model owns them. */
type FieldMeta = {
  /** Collection this id points at. */
  relation?: string
  multiple?: boolean
  /** Referenced file kind. */
  media?: 'image' | 'file'
  /** Asset folder the file is uploaded to and must come from. */
  group?: AssetGroup
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

/**
 * A file chosen in the CMS, stored as `/<group>/<file>`. The prefix is checked
 * here, so a path pointing into the wrong folder fails the build with the
 * field's name instead of a missing-file error later.
 */
const media = (kind: 'image' | 'file', group: AssetGroup = 'media') =>
  show(
    text.refine((path) => path.startsWith(`${assetPath(group)}/`), {
      error: `Expected a file in ${assetPath(group)}/`,
    }),
    { media: kind, group },
  )

/**
 * A homepage section names an area and how many of its items to show. Its
 * title, lead and "see all" page belong to the area, so the menu, the section
 * and the page can never disagree.
 */
const section = <K extends string, T extends z.ZodRawShape>(type: K, shape: T) =>
  z.object({ type: z.literal(type), ...shape })
const limit = (fallback: number) => z.int().min(1).default(fallback)

/** Editors mark what the homepage shows; without marks, the first items show. */
const featured = z.boolean().default(false)

export const linkKinds = [
  'email',
  'github',
  'linkedin',
  'facebook',
  'instagram',
  'youtube',
  'website',
] as const

/**
 * The area pages, named by their URL slug in every locale (/timeline, /en/timeline).
 * A key here must match a route folder in src/pages/[...lang]/.
 */
export const areas = ['timeline', 'press', 'blog', 'certs'] as const
export type Area = (typeof areas)[number]

export const entryTags = ['tech', 'education', 'competition', 'teaching'] as const

export const schemas = {
  /** `lead` is the homepage description; `updated` is when the profile last changed. */
  about: z.object({
    lead: text,
    updated: date.optional(),
  }),
  posts: z.object({
    title: text,
    description: text,
    date,
    /** Set when a published post is revised. */
    updated: date.optional(),
    draft: z.boolean().default(false),
    tags: z.array(text).default([]),
    origin: z.object({ label: text, url: z.httpUrl() }).optional(),
    /** Posts sharing a series id are linked to each other in part order. */
    series: z.object({ id: text, part: z.int().min(1) }).optional(),
    /** Shown when the post is shared; the site's share image otherwise. */
    image: media('image').optional(),
    featured,
  }),
  /** What Minh does now and did before; the homepage lists the open ones. */
  roles: z.object({
    order: z.int(),
    role: localized(),
    org: localized(),
    url: z.httpUrl().optional(),
    start: text,
    /** Empty while the role is current. */
    end: text.optional(),
  }),
  /** One timeline for everything: work, teaching, competitions, projects. */
  entries: z.object({
    order: z.int(),
    year: text,
    title: localized(),
    summary: localized(),
    detail: localized().optional(),
    tags: z.array(z.enum(entryTags)).default([]),
    tech: text.optional(),
    url: z.httpUrl().optional(),
    photos: z.array(media('image')).default([]),
    refs: relations('references'),
    credentials: relations('credentials'),
    featured,
  }),
  credentials: z.object({
    year: text,
    title: localized(),
    issuer: localized(),
    file: media('file', 'certs'),
    preview: media('image', 'certs/previews'),
    extra: media('file', 'certs').optional(),
    kind: z.enum(['course', 'award', 'role']),
    featured,
  }),
  outlets: z.object({
    name: localized(),
    tier: z.int().min(1).max(3),
    logo: media('image', 'logos').optional(),
  }),
  references: z.object({
    url: z.httpUrl(),
    outlet: show(text, { relation: 'outlets' }),
    title: text,
    /** A short name under an entry, when the outlet alone would be ambiguous. */
    label: localized().optional(),
    date: date.optional(),
    kind: z.enum(['press', 'video', 'award', 'code', 'social']),
    featured,
  }),
  site: z.object({
    name: localized(),
    email: z.email(),
    location: localized(),
    /** Browser tab and home-screen icon; SVG or a square image. */
    icon: media('image'),
    portrait: media('image').optional(),
    /** Shown when a page is shared; the portrait otherwise. */
    shareImage: media('image').optional(),
    cv: media('file').optional(),
    links: z
      .array(z.object({ kind: z.enum(linkKinds), label: text, url: z.url() }))
      .default([]),
    /** Header menu, in order. Leaving an area out hides it from the menu only. */
    menu: z.array(z.enum(areas)).default([...areas]),
  }),
  /** The homepage, top to bottom. Editors add, remove and reorder sections. */
  home: z.object({
    sections: z
      .array(
        z.discriminatedUnion('type', [
          section('about', {}),
          section('press', { limit: limit(4) }),
          section('timeline', { limit: limit(4) }),
          section('blog', { limit: limit(3) }),
          section('certs', { limit: limit(3) }),
        ]),
      )
      .default([]),
  }),
}
