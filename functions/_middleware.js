/**
 * Markdown for agents (Cloudflare Pages Function, runs before static assets).
 *
 * A request for a page with `Accept: text/markdown` gets the page's Markdown
 * copy, written next to its HTML at build time (src/integrations/agent-markdown.ts):
 * /timeline/ → /timeline/index.md. Everything else passes through unchanged,
 * so browsers keep getting HTML. Pages that may be served either way say so
 * with `Vary: Accept`, so a cache never hands one to the other.
 *
 * public/_routes.json keeps build assets and downloads out of this function.
 */

/** @param {string} pathname */
const markdownPath = (pathname) =>
  pathname.endsWith('/') ? `${pathname}index.md` : `${pathname}/index.md`

/** @param {{ request: Request, next: () => Promise<Response>, env: { ASSETS: { fetch: (input: Request | URL) => Promise<Response> } } }} context */
export async function onRequest({ request, next, env }) {
  const url = new URL(request.url)
  const isPage = !/\.[a-z0-9]+$/i.test(url.pathname)
  const wantsMarkdown = /\btext\/markdown\b/i.test(request.headers.get('Accept') ?? '')

  if (isPage && wantsMarkdown && ['GET', 'HEAD'].includes(request.method)) {
    const asset = await env.ASSETS.fetch(new URL(markdownPath(url.pathname), url))
    if (asset.ok) {
      const body = await asset.text()
      return new Response(request.method === 'HEAD' ? null : body, {
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          Vary: 'Accept',
          // The estimate Cloudflare's own converter uses: about 4 bytes a token.
          'x-markdown-tokens': String(
            Math.ceil(new TextEncoder().encode(body).length / 4),
          ),
        },
      })
    }
  }

  const response = await next()
  if (!isPage) return response
  const withVary = new Response(response.body, response)
  withVary.headers.append('Vary', 'Accept')
  return withVary
}
