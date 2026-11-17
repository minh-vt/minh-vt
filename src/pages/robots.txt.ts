import type { APIContext } from 'astro'

/** Built from `site` in astro.config.mjs, so the domain is written once. */
export function GET({ site }: APIContext) {
  const sitemap = new URL('sitemap-index.xml', site)
  return new Response(
    `User-agent: *\nAllow: /\nDisallow: /admin/\n\nSitemap: ${sitemap}\n`,
  )
}
