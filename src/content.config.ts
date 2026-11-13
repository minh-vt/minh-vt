import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { schemas } from '@/content/model'
import { routeLocale } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'

/** Loaders and file layout only; the field contract lives in model.ts. */
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
