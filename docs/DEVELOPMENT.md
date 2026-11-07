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

| Concern                  | Choice                    | Why                                                                     |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------- |
| Runtime, package manager | Bun                       | Official Astro recipe: https://docs.astro.build/en/recipes/bun/         |
| Framework                | Astro                     | Static by default, zero JavaScript except islands                       |
| UI islands               | Svelte 5                  | Only the theme toggle needs client state today                          |
| Content                  | MDX + content collections | Typed frontmatter, validated at build                                   |
| Styles                   | UnoCSS with `presetWind4` | Tailwind compatible, on demand output: https://unocss.dev/presets/wind4 |
| Editor                   | Sveltia CMS               | Git backed, no React, first class i18n: https://github.com/sveltia      |

## Where things live

```
src/theme/tokens.css      the only file with colours, fonts, radii, motion curves
src/styles/global.css     reset, structural primitives, type roles, prose
uno.config.ts             maps utility names onto the tokens above
src/content/about/        prose, one file per locale
src/content/posts/        prose, one file per locale
src/content/facts/        structured, one file holds every locale
src/content/references/   structured, one file per link
src/lib/content.ts        the only place that reads the collections
src/i18n/                 UI strings and path helpers
src/pages/[lang]/         one page file serves every locale
public/admin/             Sveltia CMS, config in config.yml
```

## The content model

Two questions decide where something goes.

1. **Is there a long body of prose?** Then it is an entry (`about`, `posts`) and each language
   gets its own file, because translating prose is real editing work.
2. **Is it structured?** Then it is one file with every locale inside it: a `facts` entry holds
   `title: { vi, en }`. Adding a third language adds a key to the same map, never a schema field.

Everything else is a view computed in `src/lib/content.ts`:

| What a page shows | Where it comes from                                    |
| ----------------- | ------------------------------------------------------ |
| Timeline          | `facts`, sorted by `order`, with `refs` resolved by id |
| Sources           | `references`, sorted by date, undated last             |
| Writing           | `posts` for the current locale                         |

A fact points at references by id (`refs: [a, b]`) instead of embedding them, so one article can
back several facts and no URL is stored twice. Adding something means adding **one file**.

### Rules

1. No colour, font size, radius or easing value outside `src/theme/tokens.css`. Components use
   token backed utilities (`bg-paper`, `text-ink-muted`, `border-line`) or the type roles
   (`t-hero`, `t-section`, `t-title`).
2. Prose collections take their locale from the entry path: `src/content/posts/vi/foo.mdx` has
   the id `vi/foo`, so a file cannot claim a language it is not filed under.
3. Routing is one `[lang]` dynamic route rather than a folder per locale. Astro's i18n config is
   still declared in `astro.config.mjs` so locale prefixes and `hreflang` stay consistent.
4. JavaScript is opt in. Anything that renders without interaction is an `.astro` component.

## Adding content

- **A milestone**: one YAML file in `src/content/facts/`. Fill `vi` and `en`, list the reference
  ids that prove it.
- **A link someone else published**: one YAML file in `src/content/references/`. The title stays
  verbatim in its original language; `label` is a short name used when the link appears under a
  fact where the outlet alone would be ambiguous.
- **Your own piece**: one MDX file in `src/content/posts/<lang>/`. If it first ran elsewhere, set
  `origin`, and the post page links back to the first publication.
- Or use the CMS at `/admin`, which commits to this repository through the GitHub API.

## Deployment: Cloudflare Pages, no API token

Pages builds this repository itself. There is no deploy workflow and no `CLOUDFLARE_API_TOKEN` to
rotate: connect the repository once in the dashboard and Pages builds every push, with a preview
deployment per pull request.
https://developers.cloudflare.com/pages/configuration/git-integration/

Project settings:

| Field                | Value                                                             |
| -------------------- | ----------------------------------------------------------------- |
| Build command        | `bun install --frozen-lockfile && bun run check && bun run build` |
| Output directory     | `dist`                                                            |
| Environment variable | `BUN_VERSION=1.4.4`                                               |

`BUN_VERSION` is not decoration. Pages reads version files only for Node (`.nvmrc`,
`.node-version`); for Bun it reads an environment variable, and its default is older than the
version used here. Keep `.bun-version` for local tooling and set the variable in the dashboard.
https://developers.cloudflare.com/pages/configuration/build-image/

Because `astro check` runs inside the build command, a type error fails the deploy instead of
shipping.

### Custom domain

The zone for `minhvt.id.vn` is already on Cloudflare, which is the one requirement for an apex
domain. In the Pages project: **Custom domains → Set up a domain → minhvt.id.vn**. Cloudflare
creates the apex CNAME itself through CNAME flattening; do not add the record by hand first. Add
`www` as a second custom domain if both should resolve.
https://developers.cloudflare.com/pages/configuration/custom-domains/

## Before going live

1. `site` in `astro.config.mjs`, and the `Sitemap:` line in `public/robots.txt`.
2. `backend.repo` in `public/admin/config.yml` if the repository name changes.
3. Hero image, see below.

## Known placeholders

- Hero image is `picsum.photos`. Replace the `image` prop in `src/components/Hero.astro` with a
  real portrait under `public/images/`. The press articles linked from `src/content/references/`
  carry photographs of the teams, but those belong to the outlets: ask the outlet or the
  photographer before reusing one, and do not hotlink the CDN URLs.
- `/en/blog/` has no posts yet. The list renders an empty state, which is intentional.
