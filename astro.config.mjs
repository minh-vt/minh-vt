import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import UnoCSS from '@unocss/astro'
import sitemap from '@astrojs/sitemap'
import { unified } from '@astrojs/markdown-remark'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { locales, defaultLocale } from '@/i18n/locales'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Replace with the deployed origin; used for canonical URLs and og tags.
  site: 'https://minhvt.id.vn',
  integrations: [
    UnoCSS({ injectReset: false }),
    svelte(),
    mdx(),
    sitemap({ filter: (page) => !new URL(page).pathname.startsWith('/admin/') }),
  ],
  // Optional [...lang] routes render every locale without duplicated pages.
  i18n: {
    locales: [...locales],
    defaultLocale,
    // Vietnamese is served at "/" so the root never redirects to /vi/.
    routing: { prefixDefaultLocale: false },
  },
  // Math is rendered at build time by KaTeX: no runtime JS, and MDX inherits
  // the same processor, which is why the plugins live here and not on mdx().
  markdown: {
    shikiConfig: { theme: 'css-variables' },
    processor: unified({ remarkPlugins: [remarkMath], rehypePlugins: [rehypeKatex] }),
  },
  devToolbar: { enabled: false },
})
