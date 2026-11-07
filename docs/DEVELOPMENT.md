# Development

Bun only. Node is not required to build or run this site.

```bash
bun install
bun run dev      # http://localhost:4321, forwards to /vi/
bun run build    # static output in dist/
bun run check    # astro check, types for content collections included
bun run format
```

Every script calls `bunx --bun astro ...`, so the Astro CLI runs on the Bun runtime instead of
falling back to Node through its shebang
(https://bun.com/docs/runtime#bun).

## Stack

| Concern                  | Choice                    | Why                                                                            |
| ------------------------ | ------------------------- | ------------------------------------------------------------------------------ |
| Runtime, package manager | Bun                       | Official Astro recipe: https://docs.astro.build/en/recipes/bun/                |
| Framework                | Astro                     | Static by default, zero JavaScript except islands                              |
| UI islands               | Svelte 5                  | Only the theme toggle needs client state today                                 |
| Content                  | MDX + content collections | Typed frontmatter, validated at build                                          |
| Styles                   | UnoCSS with `presetWind4` | Tailwind compatible, on demand output: https://unocss.dev/presets/wind4        |
| Editor                   | Sveltia CMS               | Git backed, no React, first class i18n: https://github.com/sveltia/sveltia-cms |

## Where things live

```
src/theme/tokens.css      the only file with colours, fonts, radii, motion curves
src/styles/global.css     reset, structural primitives, type roles, prose
uno.config.ts             maps utility names onto the tokens above
src/content/              about, timeline and posts, one folder per locale
src/data/press.ts         third party links used by the sources section
src/i18n/                 UI strings and path helpers
src/pages/[lang]/         one page file serves every locale
public/admin/             Sveltia CMS, config in config.yml
```

### Rules

1. No colour, font size, radius or easing value outside `src/theme/tokens.css`. Components use
   token backed utilities (`bg-paper`, `text-ink-muted`, `border-line`) or the type roles
   (`t-hero`, `t-section`, `t-title`).
2. Locale comes from the entry path, never from frontmatter. `src/content/timeline/vi/foo.md`
   has the id `vi/foo`, so a file cannot claim a language it is not filed under.
3. Routing is one `[lang]` dynamic route rather than a folder per locale. Astro's i18n config is
   still declared in `astro.config.mjs` so locale prefixes and `hreflang` stay consistent.
4. JavaScript is opt in. Anything that renders without interaction is an `.astro` component.

## Adding content

- **Timeline**: add a markdown file under `src/content/timeline/<lang>/`. `order` controls the
  position, `source` puts a link under the entry.
- **Post**: add one file under `src/content/posts/<lang>/`. The slug comes from the filename.
- **Press link**: append to `src/data/press.ts`.
- Or use the CMS at `/admin`, which commits to this repository through the GitHub API.

## Deploying

`bun run build` writes `dist/`. Any static host works. Two things to set before going live:

1. `site` in `astro.config.mjs` and the `Sitemap:` line in `public/robots.txt`.
2. `backend.repo` in `public/admin/config.yml` if the repository name changes.

For GitHub Pages, publish `dist/` with the base path the repository needs. For Cloudflare Pages or
Netlify, use `bun run build` and `dist` as the output directory.

## Known placeholders

- Hero image is `picsum.photos`. Replace the `image` prop in `src/components/Hero.astro` with a
  real portrait under `public/images/`.
- The only post so far is the Viettel AI Race write up, imported from the author's notes on
  2026-08-05. Adjust the date if it should sit elsewhere in the archive.
- `/en/blog/` has no posts yet. The list renders an empty state, which is intentional.
