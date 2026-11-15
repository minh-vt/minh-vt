import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { defineConfig, fontProviders } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import UnoCSS from '@unocss/astro'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { visit } from 'unist-util-visit'
import { locales, defaultLocale } from '@/i18n/locales'
import { contentFolder } from '@/content/paths'

// One pin for the CMS: the browser script and the installed types cannot drift.
const cmsVersion = JSON.parse(
  readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
).devDependencies['@sveltia/cms']

// A post page exists in every locale, but only the locales it is written in are
// real pages; the rest show the original text and point their canonical at it.
const writtenIn = (lang) => {
  const dir = new URL(`./${contentFolder('posts')}/${lang}/`, import.meta.url)
  if (!existsSync(dir)) return new Set()
  return new Set(
    readdirSync(dir, { recursive: true })
      .filter((file) => /\.mdx?$/.test(file))
      .map((file) => file.replace(/\.mdx?$/, '')),
  )
}
const postsByLang = Object.fromEntries(locales.map((lang) => [lang, writtenIn(lang)]))
const isTranslatedPage = (page) => {
  const [first, ...rest] = new URL(page).pathname.split('/').filter(Boolean)
  const lang = locales.includes(first) ? first : defaultLocale
  const [area, ...slug] = locales.includes(first) ? rest : [first, ...rest]
  return area !== 'blog' || slug.length === 0 || postsByLang[lang].has(slug.join('/'))
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
    sitemap({
      filter: (page) =>
        !new URL(page).pathname.startsWith('/admin/') && isTranslatedPage(page),
      i18n: { defaultLocale, locales: { vi: 'vi-VN', en: 'en-US' } },
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
  image: { dangerouslyProcessSVG: true },
  fonts: [
    fontFamily('Space Grotesk', '--font-grotesk', '300 700'),
    fontFamily('IBM Plex Sans', '--font-plex', '100 700'),
  ],
  // Menu and list links start loading on hover or focus.
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
  vite: { define: { __CMS_VERSION__: JSON.stringify(cmsVersion) } },
  devToolbar: { enabled: false },
})
