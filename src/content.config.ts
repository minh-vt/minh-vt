import { defineCollection } from 'astro:content'
import { glob } from 'astro/loaders'
import type { z } from 'astro/zod'
import { schemas } from '@/content/model'
import { contentFolder } from '@/content/paths'
import { routeLocale } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'

/** Loaders and file layout only; the field contract lives in model.ts. */

const base = (name: string) => `./${contentFolder(name)}`

/** One YAML file per entry, named by its id. */
const yaml = <S extends z.ZodType>(name: string, schema: S) =>
  defineCollection({ loader: glob({ pattern: '*.yaml', base: base(name) }), schema })

export const collections = {
  about: defineCollection({
    loader: glob({
      pattern: '*.mdx',
      base: base('about'),
      generateId: ({ entry }) => routeLocale(entry.replace(/\.mdx$/, '')),
    }),
    schema: schemas.about,
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
    schema: schemas.posts,
  }),
  roles: yaml('roles', schemas.roles),
  entries: yaml('entries', schemas.entries),
  credentials: yaml('credentials', schemas.credentials),
  outlets: yaml('outlets', schemas.outlets),
  references: yaml('references', schemas.references),
}
