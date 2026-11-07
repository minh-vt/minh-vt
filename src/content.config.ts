import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { z } from 'astro/zod'

/**
 * Locale lives in the entry id, not in frontmatter: an entry at
 * src/content/timeline/vi/foo.md has id "vi/foo". Ids cannot drift from paths.
 */
const about = defineCollection({
  loader: glob({ pattern: '*.mdx', base: './src/content/about' }),
  schema: z.object({
    title: z.string(),
    lead: z.string(),
    updated: z.coerce.date().optional(),
  }),
})

const timeline = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/timeline' }),
  schema: z.object({
    order: z.number(),
    year: z.string(),
    title: z.string(),
    summary: z.string(),
    metric: z.string().optional(),
    place: z.string().optional(),
    kind: z.enum(['study', 'work', 'community', 'technical']),
    source: z
      .object({
        label: z.string(),
        url: z.url(),
      })
      .optional(),
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
  }),
})

export const collections = { about, timeline, posts }
