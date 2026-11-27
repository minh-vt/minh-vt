import { describe, expect, test } from 'bun:test'
// Pages Functions live outside src/, where the @/ alias does not reach.
// eslint-disable-next-line no-restricted-imports
import { onRequest } from '../functions/_middleware.js'

/** Static files the function can find, as Pages serves them. */
const assets: Record<string, string> = {
  '/en/index.md': '# Vu Tung Minh\n',
  '/timeline/index.md': '# Dòng thời gian\n',
}
const env = {
  ASSETS: {
    fetch: async (url: Request | URL) => {
      const body =
        assets[new URL(String(url instanceof Request ? url.url : url)).pathname]
      return body ? new Response(body) : new Response('Not found', { status: 404 })
    },
  },
}

async function get(path: string, accept: string) {
  const request = new Request(`https://minhvt.id.vn${path}`, {
    headers: { Accept: accept },
  })
  const html = () =>
    Promise.resolve(new Response('<html>', { headers: { 'Content-Type': 'text/html' } }))
  return onRequest({ request, env, next: html })
}

describe('Markdown for agents', () => {
  test('an agent asking for Markdown gets the page copy', async () => {
    const response = await get('/en/', 'text/markdown')
    expect(response.headers.get('Content-Type')).toBe('text/markdown; charset=utf-8')
    expect(response.headers.get('Vary')).toBe('Accept')
    expect(response.headers.get('x-markdown-tokens')).toBe('4')
    expect(await response.text()).toBe('# Vu Tung Minh\n')
  })

  test('a path without its trailing slash finds the same copy', async () => {
    const response = await get('/timeline', 'text/markdown, text/html;q=0.9')
    expect(await response.text()).toBe('# Dòng thời gian\n')
  })

  test('a browser gets HTML, marked as varying by Accept', async () => {
    const response = await get('/en/', 'text/html,application/xhtml+xml,*/*;q=0.8')
    expect(response.headers.get('Content-Type')).toBe('text/html')
    expect(response.headers.get('Vary')).toBe('Accept')
  })

  test('files and pages without a copy pass through untouched', async () => {
    expect((await get('/robots.txt', 'text/markdown')).headers.get('Vary')).toBeNull()
    expect((await get('/missing/', 'text/markdown')).headers.get('Content-Type')).toBe(
      'text/html',
    )
  })
})
