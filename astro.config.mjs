import { existsSync, renameSync, rmdirSync } from 'node:fs'
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

// Cloudflare Pages answers a missing URL with the nearest 404.html up its path.
// Astro writes the default locale's 404 page there already, but another
// locale's as <lang>/404/index.html; move it to <lang>/404.html so /en/missing
// gets the English page.
const localeNotFound = {
  name: 'locale-not-found',
  hooks: {
    'astro:build:done': ({ dir }) => {
      for (const lang of locales.filter((locale) => locale !== defaultLocale)) {
        const folder = new URL(`${lang}/404/`, dir)
        if (!existsSync(new URL('index.html', folder))) continue
        renameSync(new URL('index.html', folder), new URL(`${lang}/404.html`, dir))
        rmdirSync(folder)
      }
    },
  },
}

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Replace with the deployed origin; used for canonical URLs and og tags.
  site: 'https://minhvt.id.vn',
  integrations: [
    UnoCSS({ injectReset: false }),
    svelte(),
    mdx(),
    localeNotFound,
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
