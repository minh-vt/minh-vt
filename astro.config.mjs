import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { join } from 'node:path'
import { defineConfig, fontProviders } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import UnoCSS from '@unocss/astro'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { visit } from 'unist-util-visit'
import { locales, defaultLocale, localeTags } from '@/i18n/locales'
import { areas, downloadTypes } from '@/content/model'

// Each area in the content model is a page folder; the menu, the homepage
// sections and "see all" links are built from that list, so a missing folder
// would only show up as a 404 in production. Fail at startup instead.
for (const area of areas) {
  if (
    !existsSync(new URL(`./src/pages/[...lang]/${area}/index.astro`, import.meta.url))
  ) {
    throw new Error(
      `Area "${area}" has no page: add src/pages/[...lang]/${area}/index.astro`,
    )
  }
}

// Downloads are served from public/ as they are, so nothing resolves them
// while pages render. After the build, every link to a downloadable file must
// point at a file in the output; a CV or PDF removed without editing its entry
// fails here, wherever public/ is configured to be.
const fileLinks = {
  name: 'file-links',
  hooks: {
    'astro:build:done': ({ dir }) => {
      const root = fileURLToPath(dir)
      const link = new RegExp(`href="(/[^"]+\\.(?:${downloadTypes.join('|')}))"`, 'gi')
      const missing = new Set()
      for (const page of readdirSync(root, { recursive: true })) {
        if (!String(page).endsWith('.html')) continue
        for (const [, href] of readFileSync(join(root, page), 'utf8').matchAll(link)) {
          if (!existsSync(join(root, decodeURI(href))))
            missing.add(`${href} (in ${page})`)
        }
      }
      if (missing.size > 0) {
        throw new Error(
          `Links to files that are not in the build:\n${[...missing].join('\n')}`,
        )
      }
    },
  },
}

// Flags pages that contain math, so only those load the KaTeX stylesheet.
function remarkMathFlag() {
  return (tree, file) => {
    visit(tree, ['math', 'inlineMath'], () => {
      file.data.astro.frontmatter.math = true
      return false
    })
  }
}

// Self-hosted at build time, with metric-matched fallbacks so the swap to the
// web font does not move the layout.
const fontFamily = (name, cssVariable, weights) => ({
  provider: fontProviders.fontsource(),
  name,
  cssVariable,
  weights: [weights],
  styles: ['normal'],
  subsets: ['latin', 'latin-ext', 'vietnamese'],
  fallbacks: ['sans-serif'],
})

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Replace with the deployed origin; used for canonical URLs and og tags.
  site: 'https://minhvt.id.vn',
  integrations: [
    UnoCSS({ injectReset: false }),
    svelte(),
    mdx(),
    fileLinks,
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith('/admin/'),
      i18n: { defaultLocale, locales: localeTags },
    }),
  ],
  // Optional [...lang] routes render every locale without duplicated pages.
  i18n: {
    locales: [...locales],
    defaultLocale,
    // Vietnamese is served at "/" so the root never redirects to /vi/.
    routing: { prefixDefaultLocale: false },
  },
  // SVGs come only from this repository (the CMS commits them as the owner), so
  // rasterizing them is safe. It lets an SVG icon become the home-screen PNG and
  // an SVG logo go through Photo like any other image instead of failing the build.
  // Every image is responsive by default: given the widest it is laid out
  // (`width`), Astro writes 1x and 2x renditions, capped at the source, and the
  // `sizes` attribute. Logos use the fixed layout.
  image: { layout: 'constrained', dangerouslyProcessSVG: true },
  fonts: [
    fontFamily('Space Grotesk', '--font-grotesk', '300 700'),
    fontFamily('IBM Plex Sans', '--font-plex', '100 700'),
  ],
  // Menu and list links start loading on hover or focus. Links to files (PDFs,
  // the CV, full-size photos) opt out with data-astro-prefetch="false", or a
  // hover would download them.
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // Math is rendered at build time by KaTeX: no runtime JS, and MDX inherits
  // the same processor, which is why the plugins live here and not on mdx().
  markdown: {
    shikiConfig: { theme: 'css-variables' },
    processor: unified({
      remarkPlugins: [remarkMath, remarkMathFlag],
      rehypePlugins: [rehypeKatex],
    }),
  },
  // The CMS editor at /admin/ is one ~2.7MB bundle and the only chunk past the
  // default 500kB; the limit sits just above it so any other large chunk still warns.
  vite: { build: { chunkSizeWarningLimit: 3000 } },
  devToolbar: { enabled: false },
})
