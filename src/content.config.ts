import { defineCollection, type SchemaContext } from 'astro:content'
import { glob } from 'astro/loaders'
import { adminCollections } from '@/admin/collections'
import { byLocale, fields, type Context } from '@/content/model'
import { contentPath } from '@/content/paths'
import { routeLocale } from '@/i18n/locales'
import { parsePostId } from '@/i18n/routes'
import { z } from 'astro/zod'

/** Loaders and file layout only; the field contract lives in model.ts. */

const base = (path: string) => `./${contentPath(path)}`

/**
 * A collection's downloads must sit in the folder the CMS uploads them to
 * (`files.public_folder` in src/admin/collections.json, the one place it is
 * written). That the file exists is checked while pages render
 * (src/lib/downloads.ts), where the content cache cannot skip it.
 */
function downloadsOf(name: string) {
  const folder = adminCollections[name]?.files?.public_folder
  return () =>
    z.string().refine((path) => folder !== undefined && path.startsWith(`${folder}/`), {
      error: folder
        ? `Expected a file in ${folder}/`
        : `${name} has no download folder (files in src/admin/collections.json)`,
    })
}

/** Astro's context plus where this collection's downloads live. */
const contextOf =
  (name: string) =>
  (astro: SchemaContext): Context<ReturnType<SchemaContext['image']>> => ({
    ...astro,
    download: downloadsOf(name),
  })

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
    schema: (astro) => z.object(fields.posts(contextOf('posts')(astro))),
  }),
  roles: defineCollection({
    loader: translated('roles'),
    schema: byLocale(z.object(fields.roles())),
  }),
  entries: defineCollection({
    loader: translated('entries'),
    schema: (astro) => byLocale(z.object(fields.entries(contextOf('entries')(astro)))),
  }),
  credentials: defineCollection({
    loader: translated('credentials'),
    schema: (astro) =>
      byLocale(z.object(fields.credentials(contextOf('credentials')(astro)))),
  }),
  outlets: defineCollection({
    loader: translated('outlets'),
    schema: (astro) => byLocale(z.object(fields.outlets(contextOf('outlets')(astro)))),
  }),
  references: defineCollection({
    loader: translated('references'),
    schema: byLocale(z.object(fields.references())),
  }),
  /** One file, src/content/site.json; its id is `site`. */
  site: defineCollection({
    loader: glob({ pattern: 'site.json', base: base('') }),
    schema: (astro) => byLocale(z.object(fields.site(contextOf('site')(astro)))),
  }),
}
