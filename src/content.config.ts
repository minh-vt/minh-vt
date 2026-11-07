import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Single source of truth, split by shape rather than by where a thing renders.
 *
 *   about      - prose, one file per locale (an entry is authored in a language)
 *   posts      - prose, one file per locale (long form: essays, articles)
 *   facts      - structured, one file holds every locale (a milestone in time)
 *   references - structured, one file, title kept verbatim (a link that proves
 *                a fact, whatever its language)
 *
 * Nothing below is a "timeline" or a "sources" collection: those are views
 * computed from `facts` and `references` in src/lib/content.ts.
 */

// Localised text is a map from language code to string. Adding a language adds
// a key inside the same map, never a new schema field.
const localized = z.record(z.string(), z.string())

const about = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/about' }),
  schema: z.object({
    title: z.string(),
    lead: z.string(),
    updated: z.coerce.date().optional(),
  }),
})

const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    // Set when the canonical copy first ran on someone else's site.
    origin: z.object({ label: z.string(), url: z.url() }).optional(),
  }),
})

const facts = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/facts' }),
  schema: z.object({
    order: z.number(),
    year: z.string(),
    title: localized,
    summary: localized,
    metric: localized.optional(),
    // Ids of reference entries that corroborate this fact.
    refs: z.array(z.string()).default([]),
  }),
})

const references = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/references' }),
  schema: z.object({
    url: z.url(),
    outlet: z.string(),
    title: z.string(),
    // Short name used when a link sits under a fact. Falls back to the outlet.
    label: z.string().optional(),
    date: z.coerce.date().optional(),
    kind: z.enum(['press', 'video', 'award', 'code', 'social']),
  }),
})

export const collections = { about, posts, facts, references }
