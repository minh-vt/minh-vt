# Development

Bun only. Node is not required to build or run this site.

```bash
bun install
bun run dev      # http://localhost:4321, Vietnamese at /
bun run build    # static output in dist/
bun run check    # Astro + Svelte type checks, then ESLint
bun run lint     # eslint only
bun run format
```

CLI scripts use `bunx --bun`, so they run on the Bun runtime instead of
falling back to Node through their shebangs
(https://bun.com/docs/runtime#bun).

## Stack

| Concern                  | Choice                    | Why                                                                     |
| ------------------------ | ------------------------- | ----------------------------------------------------------------------- |
| Runtime, package manager | Bun                       | Official Astro recipe: https://docs.astro.build/en/recipes/bun/         |
| Framework                | Astro                     | Static by default, zero JavaScript except islands                       |
| UI islands               | Svelte 5                  | Theme, mobile navigation and milestone disclosures                      |
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
src/lib/cms-fields.ts     contract -> editor fields
src/lib/cms-config.ts     contract -> Sveltia collections
src/i18n/                 UI strings, paths and date formatting
src/pages/[...lang]/      one route per page shape: / is Vietnamese, /en/ is English
src/content/strings/      UI strings per locale, JSON
src/content/site.json     email, links, places
src/pages/admin/index.astro  Sveltia CMS entry point at /admin/
src/content/model.ts      the content contract: types, rules, relationships
src/content.config.ts     loaders and file layout only
src/content/cms.json      editor labels, hints, messages and CMS settings
src/pages/admin/config.json.ts  static endpoint, one line over cmsConfig()
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
   (`t-monument`, `t-post`, `t-title`).
2. Prose collections take their locale from the entry path: `src/content/posts/vi/foo.mdx` has
   the id `vi/foo`, so a file cannot claim a language it is not filed under.
3. Vietnamese is served at `/` and English at `/en/`; the root never redirects
   (`routing.prefixDefaultLocale: false`). Optional `[...lang]` routes hold each page once.
   `pathFor()` wraps Astro's `getRelativeLocaleUrl`, so no page builds a locale prefix by hand.
4. JavaScript is opt in. Astro pages can server-render shared Svelte cards without a `client:` directive.
   Only interactive components hydrate; their controls stay disabled until handlers are ready.
5. No user-facing text in `.ts`. Strings live in `src/content/strings/<locale>.json`; contact
   details and places in `src/content/site.json`. A `.ts` file holds types and logic only.
6. Icons are pure CSS, from `@iconify-json/ph` through UnoCSS `presetIcons`. No icon runtime.

## Routes: one file per URL shape, not per language

`src/pages/[...lang]/index.astro` renders `/` and `/en/`. `getStaticPaths()` comes from
`localeParams()`, which returns `{ lang: undefined }` for the default locale and one entry per other
locale. Supported locales and the default live in `src/i18n/locales.ts`, shared with Astro and
the CMS. Add a locale there, its UI strings in `src/content/strings/<locale>.json` and the import
in `src/i18n/ui.ts`; no route file is duplicated.

The same optional rest parameter works one level down:
`src/pages/[...lang]/blog/[...slug].astro` produces `/blog/<slug>/` and `/en/blog/<slug>/`.

`Astro.params.lang` is undefined for the default locale, so every route starts with
`const lang = routeLocale(Astro.params.lang)`. Unknown locales fail rather than being cast.
The content loaders validate about filenames and post ids before loading them; posts must use
`<locale>/<slug>`, including drafts. Slug segments use lowercase ASCII letters, digits and hyphens.
The CMS uses `multiple_folders` i18n, normalizes generated slugs to ASCII and shares the slug
pattern with the loader.

## Math

Formulas are LaTeX in MDX. `remark-math` and `rehype-katex` are attached once in `astro.config.mjs`
through `markdown.processor`, so MDX inherits them; KaTeX renders at build time and the page ships
no maths JavaScript. Inline `$...$`, block `$$...$$`. `Post.astro` loads KaTeX's stylesheet and
the overflow handler, so pages without an article do not carry either.

## Dates and assets

Calendar dates are formatted by `src/i18n/format.ts` in UTC. A portfolio date is a day, not an
instant; formatting in the build machine's timezone shifted some dates by one day.

Every referenced public file — credential `file`/`preview`/`extra`, outlet `logo`, work `cover` —
is checked for existence while the page renders. That runs on every build, unlike a schema check,
which a warm content cache can skip. Paths escaping `public/` are refused.

## Motion

Only the hero name has a GSAP entrance, and `Hero.astro` owns that script. Reading content and
work cards never wait for a scroll animation. The timeline is native `<details>`/`<summary>`: it
opens without JavaScript, needs no hydration, and keeps keyboard behaviour from the browser. Reduced motion skips the entrance and
preview hover movement. Press feedback is a short CSS transform, disabled under reduced motion.

Typography belongs to `src/styles/global.css`, not UnoCSS's typography preset. This prevents a
second `.prose` rule from overriding the theme, font size and measure. Shiki's `css-variables`
theme reads the `--astro-code-*` aliases in `src/theme/tokens.css`. Long formulas and code scroll
inside the article, with keyboard focus enabled when they overflow. The post outline comes from
`render(entry).headings`, without editing the authored Markdown.

## Conventions enforced by the linter

`bun run check` runs `astro check`, `svelte-check` and `eslint`. Astro's checker skips Svelte
internals; `svelte-check --tsconfig ./tsconfig.json` checks those components and their props.
Two lint rules are errors, so they fail the build
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

Nothing is hidden for lack of a translation. The fallback policy is explicit:

- **Structured content**: the configured default locale is required and must contain nonblank
  text. Other supported locales may be omitted or left blank; `local()` falls back to the default.
  Empty maps and unknown locale keys fail validation. YAML key order has no effect.
- **Posts**: the slug is the translation key. `posts/vi/foo.mdx` and `posts/en/foo.mdx` are the
  same piece; if only one exists, every locale serves it, marked with its language, with `lang`
  set on the article body and on its title.

## Adding content

- **A milestone**: one YAML file in `src/content/facts/`. Fill `vi` and `en`, pick the references
  that prove it.
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

Credential originals live in `public/certs/`. Each entry's `preview` points at a static WebP;
PDFs are linked, never embedded or prefetched. Thumbnails are committed assets, not a build
step; upload or prepare a real preview image when adding a credential. Cloudflare needs no PDF
renderer or thumbnail-generation script.

`CredentialCard.svelte` is shared by the credential index, milestones and work cards. Add `credentials: [nand2tetris-2022]` to a work/fact entry; an unknown id fails the
build. Work's optional `cover` also renders when a real project image is available.

The homepage shows four press references and discloses the rest using native `<details>`, so
all sources remain available without JavaScript.

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
2. `settings.backend.repo` in `src/content/cms.json` if the repository name changes.
3. Run `bun run check` and `bun run build`, then inspect production output in a browser:
   both themes/locales, mobile menu, milestone disclosures, previews and article math.

## CMS contract

`src/content/model.ts` is the single source: field types, requiredness, defaults, enums,
relationships and asset kinds. Each field carries the label key it uses, so editor text stays in
`src/content/cms.json` and a missing label is a build error rather than a guessed name.

`src/lib/cms-fields.ts` reads the JSON Schema exported by Zod plus that metadata and emits editor
fields; `src/lib/cms-config.ts` wraps them in Sveltia collection shapes. There is no second field
list and no generated file in the repository. Unsupported shapes throw during the build instead of
degrading to `any`.

Relationships (`refs`, `credentials`, `outlet`, `credential`) become Sveltia Relation pickers, so
editors choose an entry instead of typing its id. `output.omit_empty_optional_fields` keeps saved
files free of empty optional keys, matching the schema.

UI strings keep their dotted keys. The CMS uses a root `keyvalue` field for these files, because
dots and `*` are invalid CMS field names.

The homepage loads references and credentials once, then passes them to fact/work accessors.
Unknown reference, outlet or credential ids fail with the owning entry named. The credential shown
beside the biography is `credential` in `about` frontmatter, not an id in a template. Standalone
MDX previews load one credential with `getEntry`, not the whole collection. Display row types are
inferred from accessors instead of repeating collection fields.
