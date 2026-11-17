import { z } from 'astro/zod'
import { defaultLocale, locales, type Lang } from '@/i18n/locales'

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
  /** A file to download (images come from `image()`). */
  media?: 'file'
  /** Filled in per locale; every other field is stored once. */
  i18n?: true
}

/**
 * What a schema needs from its loader: Astro's `image()`, which resolves the
 * stored path (relative or `@/` alias), checks the file exists and returns its
 * metadata. The admin passes a stand-in that only marks the field.
 */
export type Context<I extends z.ZodType = z.ZodType> = { image: () => I }

const text = z.string().trim().min(1)

const show = <T extends z.ZodType>(schema: T, meta: FieldMeta) => schema.meta(meta)

/** Text a translator fills in per locale; the source locale is required. */
const translatable = <T extends z.ZodType>(schema: T) => show(schema, { i18n: true })

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
 * Files to download (a PDF, an original scan, the CV). They are served from
 * public/ as they are, so the stored path is the link. The CMS offers exactly
 * these types, and anything else fails the build here.
 */
export const downloadTypes = ['pdf', 'png', 'jpeg', 'jpg', 'webp'] as const
const download = show(
  text.regex(new RegExp(`\\.(${downloadTypes.join('|')})$`, 'i'), {
    error: `Expected a file of type ${downloadTypes.join(', ')}`,
  }),
  { media: 'file' },
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
 * src/pages/[...lang]/[area]/ builds one per key and must give each a body (a
 * type error otherwise). Item pages below an area (blog/, certs/) live in a
 * folder of the same name.
 */
export const areas = ['timeline', 'press', 'blog', 'certs'] as const
export type Area = (typeof areas)[number]

export const entryTags = ['tech', 'education', 'competition', 'teaching'] as const

/**
 * Every collection's fields. Collections with translatable fields are stored
 * the way Sveltia's single_file i18n writes them; see `byLocale`.
 */
export const fields = {
  /** `lead` is the homepage description; `updated` is when the profile last changed. */
  about: () => ({
    lead: text,
    updated: date.optional(),
  }),
  posts: <I extends z.ZodType>({ image }: Context<I>) => ({
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
    image: image().optional(),
    featured,
  }),
  /** What Minh does now and did before; the homepage lists the open ones. */
  roles: () => ({
    order: z.int(),
    role: translatable(text),
    org: translatable(text),
    url: z.httpUrl().optional(),
    start: text,
    /** Empty while the role is current. */
    end: text.optional(),
  }),
  /** One timeline for everything: work, teaching, competitions, projects. */
  entries: <I extends z.ZodType>({ image }: Context<I>) => ({
    order: z.int(),
    year: text,
    title: translatable(text),
    summary: translatable(text),
    detail: translatable(text).optional(),
    tags: z.array(z.enum(entryTags)).default([]),
    tech: text.optional(),
    url: z.httpUrl().optional(),
    photos: z.array(image()).default([]),
    refs: relations('references'),
    credentials: relations('credentials'),
    featured,
  }),
  credentials: <I extends z.ZodType>({ image }: Context<I>) => ({
    year: text,
    title: translatable(text),
    issuer: translatable(text),
    file: download,
    preview: image(),
    extra: download.optional(),
    kind: z.enum(['course', 'award', 'role']),
    featured,
  }),
  outlets: <I extends z.ZodType>({ image }: Context<I>) => ({
    name: translatable(text),
    tier: z.int().min(1).max(3),
    logo: image().optional(),
  }),
  references: () => ({
    url: z.httpUrl(),
    outlet: show(text, { relation: 'outlets' }),
    title: text,
    /** A short name under an entry, when the outlet alone would be ambiguous. */
    label: translatable(text).optional(),
    date: date.optional(),
    kind: z.enum(['press', 'video', 'award', 'code', 'social']),
    featured,
  }),
  site: <I extends z.ZodType>({ image }: Context<I>) => ({
    name: translatable(text),
    email: z.email(),
    location: translatable(text),
    /** Browser tab and home-screen icon; SVG or a square image. */
    icon: image(),
    portrait: image().optional(),
    /** Shown when a page is shared; the portrait otherwise. */
    shareImage: image().optional(),
    cv: download.optional(),
    links: z
      .array(z.object({ kind: z.enum(linkKinds), label: text, url: z.url() }))
      .default([]),
    /** Header menu, in order. Leaving an area out hides it from the menu only. */
    menu: z.array(z.enum(areas)).default([...areas]),
  }),
  /** The homepage, top to bottom. Editors add, remove and reorder sections. */
  home: () => ({
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
} satisfies Record<string, (context: Context) => z.ZodRawShape>

/** The fields of a translated record, merged for one locale. */
export type Translated<T> = { source: T; translations: Partial<Record<Lang, Partial<T>>> }

/** Sveltia writes a translation it was given no text for as an empty string. */
const withoutEmpty = (value: unknown) =>
  value && typeof value === 'object'
    ? Object.fromEntries(Object.entries(value).filter(([, item]) => item !== ''))
    : value

/**
 * Sveltia's single_file i18n stores one key per locale: `{ vi: {...}, en: {...} }`.
 * The source locale holds every field; another locale holds only the
 * translatable ones it has text for, and falls back to the source otherwise.
 */
export function byLocale<S extends z.ZodObject>(source: S) {
  const translation = z.preprocess(withoutEmpty, source.partial()).optional()
  const shape = Object.fromEntries(
    locales.map((lang) => [lang, lang === defaultLocale ? source : translation]),
  )
  return z.object(shape).transform(
    (stored): Translated<z.output<S>> => ({
      source: stored[defaultLocale] as z.output<S>,
      // Without the source locale: Astro resolves each image path once, where
      // it first finds it, so the source must be the only copy.
      translations: Object.fromEntries(
        Object.entries(stored).filter(([lang]) => lang !== defaultLocale),
      ) as Partial<Record<Lang, Partial<z.output<S>>>>,
    }),
  )
}

/** One locale's view of a translated record. */
export function inLocale<T>(record: Translated<T>, lang: Lang): T {
  return { ...record.source, ...record.translations[lang] }
}
