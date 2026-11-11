import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'
import { defaultLocale, locales, routeLocale } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'

const text = z.string().trim().min(1)
// Structured content requires the source locale; other translations may fall back.
const localized = z
  .partialRecord(z.enum(locales), z.string().trim())
  .refine((value) => Boolean(value[defaultLocale]))
  .meta({ required: [defaultLocale] })
const date = z.coerce.date().meta({ type: 'string', format: 'date-time' })
const ids = z.array(text).default([])

// The CMS endpoint derives its fields from these same schemas.
export const schemas = {
  about: z.object({ title: text, lead: text, updated: date.optional() }),
  posts: z.object({
    title: text,
    description: text,
    date,
    draft: z.boolean().default(false),
    tags: z.array(text).default([]),
    origin: z.object({ label: text, url: z.url() }).optional(),
  }),
  facts: z.object({
    order: z.int(),
    year: text,
    title: localized,
    summary: localized,
    metric: localized.optional(),
    refs: ids,
    credentials: ids,
  }),
  work: z.object({
    order: z.int(),
    year: text,
    title: localized,
    summary: localized,
    metric: localized.optional(),
    tech: text,
    refs: ids,
    cover: text.optional(),
    credentials: ids,
  }),
  credentials: z.object({
    year: text,
    title: localized,
    issuer: localized,
    file: text,
    preview: text,
    extra: text.optional(),
    kind: z.enum(['course', 'award', 'role']),
  }),
  outlets: z.object({
    name: localized,
    tier: z.int().min(1).max(3),
    logo: text.optional(),
  }),
  references: z.object({
    url: z.url(),
    outlet: text,
    title: text,
    label: text.optional(),
    date: date.optional(),
    kind: z.enum(['press', 'video', 'award', 'code', 'social']),
  }),
  site: z.object({
    email: z.email(),
    github: z.url(),
    linkedin: z.url(),
    location: localized,
  }),
}

export const collections = {
  about: defineCollection({
    loader: glob({
      pattern: '*.mdx',
      base: './src/content/about',
      generateId: ({ entry }) => routeLocale(entry.replace(/\.mdx$/, '')),
    }),
    schema: schemas.about,
  }),
  posts: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: './src/content/posts',
      generateId: ({ entry }) => {
        const id = entry.replace(/\.(md|mdx)$/, '')
        parsePostId(id)
        return id
      },
    }),
    schema: schemas.posts,
  }),
  facts: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/content/facts' }),
    schema: schemas.facts,
  }),
  work: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/content/work' }),
    schema: schemas.work,
  }),
  credentials: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/content/credentials' }),
    schema: schemas.credentials,
  }),
  outlets: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/content/outlets' }),
    schema: schemas.outlets,
  }),
  references: defineCollection({
    loader: glob({ pattern: '*.yaml', base: './src/content/references' }),
    schema: schemas.references,
  }),
}
