import type { APIContext } from 'astro'

/**
 * Built from `site` in astro.config.mjs, so the domain is written once.
 *
 * Content-Signal (https://contentsignals.org/) states what crawlers may do
 * with the content: be indexed for search (`search`), be used as input to an
 * AI answer (`ai-input`), and train AI models (`ai-train`). The site allows
 * all three: it exists to be found and cited, by people and by models.
 */
const contentSignal = 'search=yes, ai-input=yes, ai-train=yes'

export function GET({ site }: APIContext) {
  const sitemap = new URL('sitemap-index.xml', site)
  return new Response(
    [
      'User-agent: *',
      `Content-Signal: ${contentSignal}`,
      'Allow: /',
      'Disallow: /admin/',
      '',
      `Sitemap: ${sitemap}`,
      '',
    ].join('\n'),
  )
}
