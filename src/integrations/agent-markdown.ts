import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { AstroIntegration } from 'astro'
import type { Element, Root } from 'hast'
import { select, selectAll } from 'hast-util-select'
import rehypeParse from 'rehype-parse'
import rehypeRemark from 'rehype-remark'
import remarkGfm from 'remark-gfm'
import remarkStringify from 'remark-stringify'
import { unified } from 'unified'

/**
 * Markdown for agents: after the build, every page gets a Markdown copy next
 * to its HTML (timeline/index.html → timeline/index.md), and the Pages Function
 * in functions/_middleware.js serves it to requests that send
 * `Accept: text/markdown`. Browsers keep getting HTML.
 *
 * The copy holds what a reader came for: front matter from the page's own
 * metadata, then <main> without what is only drawn (aria-hidden: icons, the
 * SVG name), decorative images (alt=""), controls (the timeline filter),
 * scripts or styles, with links made absolute because the copy is read away
 * from the page. Header, menu and footer are left out.
 */

const parse = unified().use(rehypeParse)
const toMarkdown = unified()
  // Source comments (Astro's and ours) are not content.
  .use(rehypeRemark, { nodeHandlers: { comment: () => undefined } })
  .use(remarkGfm)
  .use(remarkStringify, { bullet: '-' })

/** Pages that are not content: error pages and the CMS. */
const skipped = (page: string) =>
  /(^|\/)404\.html$/.test(page) || page.startsWith('admin/')

function attribute(tree: Root, selector: string, name: string) {
  const value = select(selector, tree)?.properties?.[name]
  return typeof value === 'string' ? value : undefined
}

async function markdownOf(html: string) {
  const tree = parse.parse(html)
  const main = select('main', tree)
  if (!main) return undefined
  const drop = '[aria-hidden=true], script, style, svg, dialog, fieldset, img[alt=""]'
  for (const node of selectAll(drop, main)) {
    node.tagName = 'template'
    node.children = []
  }
  const meta = {
    title: (select('title', tree)?.children[0] as { value?: string } | undefined)?.value,
    description: attribute(tree, 'meta[name=description]', 'content'),
    url: attribute(tree, 'link[rel=canonical]', 'href'),
    lang: attribute(tree, 'html', 'lang'),
  }
  const frontMatter = Object.entries(meta)
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
  if (meta.url) {
    for (const node of selectAll('a[href], img[src]', main)) {
      const key = node.tagName === 'a' ? 'href' : 'src'
      node.properties[key] = new URL(String(node.properties[key]), meta.url).href
    }
  }
  const root: Root = { type: 'root', children: [main as Element] }
  const body = toMarkdown.stringify(await toMarkdown.run(root))
  return `---\n${frontMatter.join('\n')}\n---\n\n${body}`
}

export const agentMarkdown = (): AstroIntegration => ({
  name: 'agent-markdown',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const root = fileURLToPath(dir)
      for (const page of readdirSync(root, { recursive: true }).map(String)) {
        if (!page.endsWith('index.html') || skipped(page)) continue
        const markdown = await markdownOf(readFileSync(join(root, page), 'utf8'))
        if (markdown) writeFileSync(join(root, page.replace(/\.html$/, '.md')), markdown)
      }
    },
  },
})
