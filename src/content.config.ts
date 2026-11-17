import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import { byLocale, fields } from '@/content/model'
import { contentPath } from '@/content/paths'
import { routeLocale } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'
import { z } from 'astro/zod'

/** Loaders and file layout only; the field contract lives in model.ts. */

const base = (path: string) => `./${contentPath(path)}`

/** One YAML file per record, every locale inside it (Sveltia single_file). */
const translated = (name: keyof typeof fields) =>
  glob({ pattern: '*.yaml', base: base(name) })

export const collections = {
  about: defineCollection({
    loader: glob({
      pattern: '*.mdx',
      base: base('about'),
      generateId: ({ entry }) => routeLocale(entry.replace(/\.mdx$/, '')),
    }),
    schema: z.object(fields.about()),
  }),
  posts: defineCollection({
    loader: glob({
      pattern: '**/*.{md,mdx}',
      base: base('posts'),
      generateId: ({ entry }) => {
        const id = entry.replace(/\.(md|mdx)$/, '')
        parsePostId(id)
        return id
      },
    }),
    schema: (context) => z.object(fields.posts(context)),
  }),
  roles: defineCollection({
    loader: translated('roles'),
    schema: byLocale(z.object(fields.roles())),
  }),
  entries: defineCollection({
    loader: translated('entries'),
    schema: (context) => byLocale(z.object(fields.entries(context))),
  }),
  credentials: defineCollection({
    loader: translated('credentials'),
    schema: (context) => byLocale(z.object(fields.credentials(context))),
  }),
  outlets: defineCollection({
    loader: translated('outlets'),
    schema: (context) => byLocale(z.object(fields.outlets(context))),
  }),
  references: defineCollection({
    loader: translated('references'),
    schema: byLocale(z.object(fields.references())),
  }),
  /** One file, src/content/site.json; its id is `site`. */
  site: defineCollection({
    loader: glob({ pattern: 'site.json', base: base('') }),
    schema: (context) => byLocale(z.object(fields.site(context))),
  }),
}
