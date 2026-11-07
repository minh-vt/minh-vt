import { defineConfig } from 'astro/config'
import svelte from '@astrojs/svelte'
import mdx from '@astrojs/mdx'
import UnoCSS from '@unocss/astro'
import sitemap from '@astrojs/sitemap'

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  // Replace with the deployed origin; used for canonical URLs and og tags.
  site: 'https://minh-vt.github.io',
  integrations: [UnoCSS({ injectReset: false }), svelte(), mdx(), sitemap()],
  // Locale source of truth. Routing is driven by src/pages/[lang] so that one
  // page file serves every locale instead of duplicating folders per locale.
  i18n: {
    locales: ['vi', 'en'],
    defaultLocale: 'vi',
    routing: { prefixDefaultLocale: true },
  },
  devToolbar: { enabled: false },
})
