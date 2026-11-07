import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import UnoCSS from '@unocss/astro'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Replace with the deployed origin; used for canonical URLs and og tags.
  site: 'https://minhvt.id.vn',
  integrations: [UnoCSS({ injectReset: false }), svelte(), mdx(), sitemap()],
  // Locale source of truth. Routes are thin wrappers under src/pages and
  // src/pages/en; the page body lives once in src/views.
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    // Vietnamese is served at "/" so the root never redirects to /vi/.
    routing: { prefixDefaultLocale: false },
  },
  // Math is rendered at build time by KaTeX: no runtime JS, and MDX inherits
  // the same processor, which is why the plugins live here and not on mdx().
  markdown: {
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
  },
  devToolbar: { enabled: false },
})
