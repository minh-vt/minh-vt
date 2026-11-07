# Development

Bun only. Node is not required to build or run this site.

```bash
bun install
bun run dev      # http://localhost:4321, forwards to /vi/
bun run build    # static output in dist/
bun run check    # astro check, then eslint
bun run lint     # eslint only
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
src/views/                page bodies, one file each, taking a lang prop
src/pages/                thin routes: / is Vietnamese, /en/ is English
src/content/strings/      UI strings per locale, JSON
src/content/site.json     email, links, places
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
| Sources           | `references`, sorted by outlet tier, then newest first |
| Writing           | `posts` for the current locale                         |

A fact points at references by id (`refs: [a, b]`) instead of embedding them, so one article can
back several facts and no URL is stored twice. Adding something means adding **one file**.

An outlet is an entry of its own: `name` per locale, `tier`, and an optional `logo` under
`public/logos/`. A reference points at one by **id**, never by a display string, so "Dan Tri" and
"Dân Trí" cannot both exist. Ids are validated when collections are read, which turns a typo into a
build failure that names the known ids. Tiers: 1 national press, organisers, government; 2 official
result pages; 3 local or organisational outlets.

### Rules

1. No colour, font size, radius or easing value outside `src/theme/tokens.css`. Components use
   token backed utilities (`bg-paper`, `text-ink-muted`, `border-line`) or the type roles
   (`t-hero`, `t-section`, `t-title`).
2. Prose collections take their locale from the entry path: `src/content/posts/vi/foo.mdx` has
   the id `vi/foo`, so a file cannot claim a language it is not filed under.
3. Vietnamese is served at `/` and English at `/en/`; the root never redirects
   (`routing.prefixDefaultLocale: false`). Routes in `src/pages` are thin wrappers and the body
   lives once in `src/views`. `pathFor()` wraps Astro's `getRelativeLocaleUrl`, so no page builds a
   locale prefix by hand.
4. JavaScript is opt in. Anything that renders without interaction is an `.astro` component.
5. No user-facing text in `.ts`. Strings live in `src/content/strings/<locale>.json`; contact
   details and places in `src/content/site.json`. A `.ts` file holds types and logic only.
6. Icons are pure CSS, from `@iconify-json/ph` through UnoCSS `presetIcons`. No icon runtime.

## Routes: one file per URL shape, not per language

`src/pages/[...lang]/index.astro` renders `/` and `/en/`. `getStaticPaths()` comes from
`localeParams()`, which returns `{ lang: undefined }` for the default locale and one entry per other
locale. Adding a language is a line in `src/i18n/ui.ts` plus `src/content/strings/<locale>.json`; no
route file and no new folder.

The same optional rest parameter works one level down:
`src/pages/[...lang]/blog/[...slug].astro` produces `/blog/<slug>/` and `/en/blog/<slug>/`.

`Astro.params.lang` is undefined for the default locale, so every route starts with
`const lang = (Astro.params.lang ?? defaultLocale) as Lang`.

## Math

Formulas are LaTeX in MDX. `remark-math` and `rehype-katex` are attached once in `astro.config.mjs`
through `markdown.processor`, so MDX inherits them; KaTeX renders at build time and the page ships
no maths JavaScript. Inline `$...$`, block `$$...$$`.

## Motion

One implementation, in `src/layouts/Base.astro`: GSAP with ScrollTrigger animates `[data-reveal]`
elements **from** an offset (`gsap.from`) with `once: true`. Nothing is hidden in CSS, so if the
script never runs the content is still there. `prefers-reduced-motion` skips the animation
entirely. Work cards use their own GSAP entrance inside the island.

## Conventions enforced by the linter

`bun run check` runs `astro check` and `eslint`. Two rules are errors, so they fail the build
instead of sitting in review:

| Rule                              | Why                                            | Fix                              |
| --------------------------------- | ---------------------------------------------- | -------------------------------- |
| No relative imports (`./`, `../`) | One alias means a file can move without a hunt | `@/lib/content`                  |
| No colour literals                | Colour has one home                            | A token utility, or `var(--ink)` |

The alias is `@/*` to `src/*`, declared in `tsconfig.json`; Astro resolves it natively
(https://docs.astro.build/en/guides/typescript/#import-aliases).

`src/theme/browser-chrome.ts` is the single exemption from the colour rule: the `theme-color` meta
tags are read before any CSS exists, so those two literals cannot be tokens.

Warnings, not errors, cover code that is getting hard to read: `max-depth`, `max-params`,
`complexity`, `no-console`, and `max-lines` for scripts and components. `.astro` templates are
exempt from line count, because length there says little about comprehension.

## Untranslated content

Nothing is hidden for lack of a translation, and nothing falls back to a hardcoded language
constant.

- **Structured content** (`facts`): `local()` returns the requested language, else the first key in
  the map. Put the source language first in the file and the fallback takes care of itself.
- **Posts**: the slug is the translation key. `posts/vi/foo.mdx` and `posts/en/foo.mdx` are the
  same piece; if only one exists, every locale serves it, marked with its language, with `lang`
  set on the article body and on its title.

## Adding content

- **A milestone**: one YAML file in `src/content/facts/`. Fill `vi` and `en`, list the reference
  ids that prove it.
- **An outlet**: one YAML file in `src/content/outlets/`. The filename is the id references use;
  give it a `tier` and, when one exists, a `logo`.
- **A link someone else published**: one YAML file in `src/content/references/`. `outlet` is the
  outlet id. The title stays verbatim in its original language; `label` is a short name used when
  the outlet alone would be ambiguous under a fact.
- **Your own piece**: one MDX file in `src/content/posts/<lang>/`. If it first ran elsewhere, set
  `origin`, and the post page links back to the first publication.
- Or use the CMS at `/admin`, which commits to this repository through the GitHub API.

## Collections at a glance

| Collection       | Shape            | One file holds                    |
| ---------------- | ---------------- | --------------------------------- |
| `about`, `posts` | prose per locale | one language                      |
| `facts`          | milestones       | every locale, plus `refs`         |
| `work`           | projects         | every locale, plus `tech`, `refs` |
| `credentials`    | certificates     | every locale, plus `file`         |
| `outlets`        | publishers       | every locale, plus `tier`, `logo` |
| `references`     | outbound links   | one link                          |

`credentials` files live in `public/certs/`. A PNG renders as a preview in the grid; a PDF is
linked, never embedded, so nothing loads until someone opens it.

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

Because `check` runs inside the build command, a type error or a lint error fails the deploy
instead of shipping.

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
