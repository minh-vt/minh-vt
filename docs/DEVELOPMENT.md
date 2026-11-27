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
| UI islands               | Svelte 5 + melt           | Theme toggle, the sheets, copying the email                             |
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
src/content/entries/      structured, one file holds every locale
src/content/home.json     homepage sections, edited in the CMS
src/assets/               uploaded images (photos in media/, logos/, certs/)
public/                   uploaded files to download (PDF, CV), served as they are
src/content/references/   structured, one file per link
src/lib/content.ts        the only place that reads the collections
src/i18n/                 UI strings, paths and date formatting
src/pages/[...lang]/      one route per page shape: / is Vietnamese, /en/ is English
src/content/strings/      UI strings per locale, JSON
src/content/site.json     email, links, places
src/pages/admin/index.astro  Sveltia CMS entry point at /admin/
src/content/model.ts      the content contract: types, rules, relationships
src/content.config.ts     loaders and file layout only
src/admin/                everything the editor needs; nothing else imports it
src/admin/labels.json     Vietnamese editor labels, hints and messages
src/admin/settings.json   backend, output, slug and upload settings
src/admin/collections.json  collection shapes and which collection is a relation target
src/admin/fields.ts       contract -> Sveltia fields, typed by @sveltia/cms
src/admin/config.ts       assembles the CmsConfig
src/pages/admin/          route surface only: /admin/ and /admin/config.json
```

## The content model

Two questions decide where something goes.

1. **Is there a long body of prose?** Then it is an entry (`about`, `posts`) and each language
   gets its own file, because translating prose is real editing work.
2. **Is it structured?** Then it is one file with every locale inside it, in the shape Sveltia's
   `single_file` i18n writes: `vi:` holds every field, `en:` only the translated ones. A field is
   translated when `model.ts` wraps it in `translatable()`; adding a third language adds a top-level
   key to each file, never a schema field.

Two files are single documents: `src/content/site.json` (name, email, icon, portrait, CV and a free
list of links) and `src/content/home.json` (the homepage). `site` is a one-file collection so its
images go through `image()`; read it with `siteFor(lang)` from `src/lib/site.ts`. Both are edited in
the CMS like everything else.

The site has four areas, each with one page whose key is its English slug in every locale:
`timeline`, `press`, `blog` and `certs` (`/timeline`, `/en/timeline` and so on). The list is the
`areas` enum in `src/content/model.ts`, next to the other enums. One route,
`src/pages/[...lang]/[area]/index.astro`, builds every area page from a `Record<Area, …>` of
bodies (`src/components/areas/`), so an area without a body, or a body without an area, is a type
error. Item pages below an area (`blog/`, `certs/`) live in a folder named after it. The header menu is `site.menu` in the CMS: editors reorder areas or leave one out, and a
menu item always leads to one page. An area's name and lead live in the UI strings
(`area.<key>.title`, `area.<key>.lead`), shared by the menu, the homepage section and the page.

The homepage is a hub. `home.json` lists sections by `type` (`about`, `press`, `timeline`,
`blog`, `certs`) with a `limit`; editors add, remove and reorder them in the CMS. Each
section shows the items marked `featured` in its collection, or the first ones when none are
marked, and ends with "See all (n)" only when its page holds more than it shows.

| What a page shows | Where it comes from                                                           |
| ----------------- | ----------------------------------------------------------------------------- |
| Hero              | `site` (name, portrait, links, CV) and `roles` without an `end`               |
| Press             | `references` of kind `press` or `award`, by outlet tier then date             |
| Timeline          | `entries` by `order`; the page filters by tag and keeps the filter in `?tag=` |
| Writing           | `posts` for the current locale; `series` links parts to each other            |
| Credentials       | `credentials` by year; each has a page at `/certs/<id>` with the originals    |

An entry points at references by id (`refs: [a, b]`) instead of embedding them, so one article can
back several entries and no URL is stored twice. Adding something means adding **one file**.

An outlet is an entry of its own: `name` per locale, `tier`, and an optional `logo` under
`src/assets/logos/`. A reference points at one by **id**, never by a display string, so "Dan Tri" and
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
`src/pages/[...lang]/blog/[...slug].astro` produces `/blog/<slug>/` and `/en/blog/<slug>/`, each
only for posts written in that locale.

`Astro.params.lang` is undefined for the default locale, so every route starts with
`const lang = routeLocale(Astro.params.lang)`. Unknown locales fail rather than being cast.
The content loaders validate about filenames and post ids before loading them; posts must use
`<locale>/<slug>`, including drafts. Slug segments use lowercase ASCII letters, digits and hyphens.
The CMS uses `multiple_folders` i18n, normalizes generated slugs to ASCII and shares the slug
pattern with the loader.

## Math

Formulas are LaTeX in MDX. `remark-math` and `rehype-katex` are attached once in `astro.config.mjs`
through `markdown.processor`, so MDX inherits them; KaTeX renders at build time and the page ships
no maths JavaScript. Inline `$...$`, block `$$...$$`. A small remark plugin in the same config
sets `math: true` on posts that contain a formula, and only those posts link KaTeX's stylesheet
(imported with `?url`, so it is its own file). `Post.astro` also owns the overflow handler.

## Dates and assets

Calendar dates are formatted by `src/i18n/format.ts` in UTC. A portfolio date is a day, not an
instant; formatting in the build machine's timezone shifted some dates by one day.

Every referenced file (credential `file`/`preview`/`extra`, outlet `logo`, entry `photos`, site
`icon`/`portrait`/`cv`) is checked twice: the schema checks it points into its field's asset
folder, and `src/lib/assets.ts` checks the file exists while the page renders. The second check
runs on every build, unlike a schema check, which a warm content cache can skip.

## Motion

Only the hero name has an entrance: a CSS animation, one letter after another (`--duration-hero`,
`--stagger`). An inline script in `Hero.astro` sets `data-intro` before first paint, once per
browser session, so returning to the homepage never makes the reader wait. Reduced motion skips
the entrance and every transform.

Every scroll-linked behaviour is a toggle, so none of them loads an animation library. They use
`onScroll()` from `src/lib/scroll.ts` (one `requestAnimationFrame` per frame) or an
`IntersectionObserver`: the header hides while reading down and returns on the way up, the small
name appears once the hero name has left, the dock appears a screen down, and the post contents
mark the heading being read. The reading progress bar is a CSS scroll timeline, with `onScroll()`
as the fallback where `animation-timeline` is unsupported (Firefox). Its CSS is written as
longhands: the minifier folds `animation` plus `animation-timeline` into an invalid shorthand.

The mobile menu and the mobile contents are melt `Dialog`s styled as bottom sheets: melt owns
focus, Escape, outside clicks and the scroll lock. The sheet uses `--ease-drawer`.

The accent marks state only: the section in view, the heading being read, the progress bar.
Hover never changes a colour to the accent.

## Controls and links

Every interactive element is one of five classes in `src/styles/global.css`. A component adds
layout utilities around them (margin, `hidden md:inline-flex`), never its own size, border,
font or hover colour.

| Class         | Use                                                   | Shape                                                   |
| ------------- | ----------------------------------------------------- | ------------------------------------------------------- |
| `.btn`        | an action: Contact, copy email, a filter chip         | 44px tall, display font, border follows the text colour |
| `.btn-ghost`  | a secondary control: language, theme, menu, close     | `.btn` without a border, muted until hovered            |
| `.btn-square` | an icon-only or two-letter control                    | 44 by 44px, icon at 20px                                |
| `.link`       | a link in a list or menu                              | muted, ink on hover or when current                     |
| `.link-text`  | a link inside a sentence, in UI copy or in an article | underlined, underline darkens on hover                  |

A checked radio inside a `.btn` (the timeline filter) fills it with ink. Focus is the global
`:focus-visible` ring; no element sets its own. Icons are Phosphor classes without a `size-*`:
`presetIcons` sizes them at 1.15em, so an icon always matches the text beside it.

Sheets (the mobile menu and the mobile contents) are one component, `Sheet.svelte`, around melt's
`Dialog`. Homepage sections share `HomeSection.astro`. The lists (`EntryList`, `PressList`, `PostList`,
`CredentialGrid`) render the same items on the homepage and on their area page, and every area page
opens with `PageHeader.astro`. The back-to-top dock lives in `Base.astro` on every page; the post
layout adds its contents button to it through the `dock` slot. Page
titles get the site name appended once, in `Base.astro`. Lightbox control names come from
`lightboxLabels()` in `src/i18n/utils.ts`.

Svelte islands hydrate only where a component needs one: the mobile menu with `client:media`
below the desktop breakpoint, the contents sheet below `lg`, the lightbox when visible. The theme
toggle and the copy-email button are plain `<button>`s with a few lines of script
(`ThemeToggle.astro`, `CopyEmail.astro`), so a page without a sheet or a lightbox loads no Svelte
runtime. Both render disabled and enable themselves once their script runs.

Links prefetch on hover or focus (`prefetch.prefetchAll` in `astro.config.mjs`).

## Fonts

Space Grotesk and IBM Plex Sans come from the Fonts API (`fonts` in `astro.config.mjs`, provider
Fontsource): downloaded at build time, served from `/_astro/fonts/`, split by subset (latin,
latin-ext, vietnamese) with `unicode-range`. `<Font>` in `Base.astro` inlines the `@font-face`
rules and preloads the latin files. Each family gets a fallback whose metrics are adjusted to
match, so swapping to the web font does not move the layout (CLS 0). `--font-display` and
`--font-body` in `tokens.css` point at the variables the API defines (`--font-grotesk`,
`--font-plex`).

## Search and sharing

`Base.astro` writes the canonical URL, `hreflang` alternates with `x-default`, Open Graph and the
Twitter card for every page. Helpers live in `src/lib/seo.ts`.

- Share image: a page's own `image`, else `site.shareImage`, else the portrait. It is re-encoded
  to JPEG at most 1200px wide and never cropped; a wide image (about 1200×630) gets the large
  card, a square one the small card. Posts take `image`, credential pages use their preview.
- One URL per piece of writing: a post has a page only in the locale it is written in, and every
  list, feed and neighbour link goes there (`postPath(id)`). A page declares `hreflang` only for
  locales it exists in, the language switch sends the other locale to its homepage, and the
  sitemap is right without a filter.
- Structured data: `ProfilePage` with a `Person` on the homepage (`about.lead` is its description
  and the meta description, `about.updated` its `dateModified`, `site.location` its
  `homeLocation`, current roles its `affiliation`); `BlogPosting` on posts, with the same
  `Person` as author; `EducationalOccupationalCredential` on credential pages; a
  `BreadcrumbList` from `BackLink.astro` on every page below the homepage.
- Feeds: `/rss.xml` and `/en/rss.xml` (`@astrojs/rss`), linked from every page's head.
- The home-screen icon is the CMS icon (`site.icon`) rendered as a 180px PNG.

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

There is no `theme-color` meta tag. Most browsers ignore it (Firefox never supported it, Safari
26 dropped it), and the ones that read it would need a colour copied out of `tokens.css`. The page's
`color-scheme`, set by the theme, is what browsers draw their own controls from.

Breakpoints live in `src/theme/breakpoints.ts`. UnoCSS builds `sm:`/`md:`/`lg:` from it,
`global.css` uses them through `theme("breakpoint.md")` in plain `@media` rules (standard CSS, so the editor's CSS server does not flag it; UnoCSS replaces it at build), and markup uses `from()`/`below()` for `client:media`
and image `sizes`. No component writes an `em` media query by hand.

The hero and footer name is `Monument.astro`: SVG text whose `textLength` makes each line exactly
as wide as its box, and the SVG scales to the column. A name of any length fills the width and
cannot overflow; `--text-monument-max` caps how large it gets. One line on wide screens, a line
per word on phones. The entrance animation fades the letters (SVG `tspan`s take opacity, not
transforms).

Warnings, not errors, cover code that is getting hard to read: `max-depth`, `max-params`,
`complexity`, `no-console`, and `max-lines` for scripts and components. `.astro` templates are
exempt from line count, because length there says little about comprehension.

## Untranslated content

Nothing is hidden for lack of a translation. The fallback policy is explicit:

- **Structured content**: the default locale holds every field and is required. Another locale
  holds the translated fields it has text for; `inLocale()` (`model.ts`) falls back to the
  default for the rest, and a blank translation counts as missing. A translation may hold only
  fields marked `translatable()`: a hand-typed `en.tier` fails the build instead of overriding
  the source. `translatable()` takes strings only, because blanks are dropped one level deep.
- **Posts**: the slug is the translation key. `posts/vi/foo.mdx` and `posts/en/foo.mdx` are the
  same piece; if only one exists, every locale's list shows it, marked with its language, and
  links to the one page it has.

## Adding content

- **A timeline entry**: one YAML file in `src/content/entries/`. Fill `vi` and `en`, pick `tags` for
  the filter and the references that prove it. `photos` is optional; the row drops its photo
  column without one.
- **A role**: one YAML file in `src/content/roles/`. Leave `end` empty while it is current; the hero
  lists current roles only.
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
| `entries`        | timeline rows    | every locale, `tags`, `photos`    |
| `roles`          | positions held   | every locale, `start`, `end`      |
| `credentials`    | certificates     | every locale, plus `file`         |
| `outlets`        | publishers       | every locale, plus `tier`, `logo` |
| `references`     | outbound links   | one link                          |

Post images: Markdown image syntax is optimised by Astro as it is. For a caption, `Figure.astro` is
available in posts without an import and takes an imported image:
`import photo from '@/assets/media/photo.webp'`, then `<Figure src={photo} alt="…" caption="…" />`.

Credential originals live in `public/certs/` and are served at the path content stores
(`/certs/cs50-ai-2022.pdf`), under their own name, so a shared link survives a new upload. Their
previews live in `src/assets/certs/`. PDFs are linked, never embedded, and their links opt out of
prefetch. Previews are uploaded images, not a build step, so Cloudflare needs no PDF renderer.

`CredentialCard.astro` renders the credential index. On the homepage an entry with
`credentials: [nand2tetris-2022]` links straight to the file; an unknown id fails the build.

### Images and files

Every image and file, including the site icon, is chosen in the CMS. The two kinds live apart:

- **Images** live in `src/assets/` and the CMS writes an alias path such as
  `@/assets/logos/first.webp`. The schema reads it with Astro's `image()`, which resolves the
  path, fails the build when the file is missing and hands components `ImageMetadata`. Nothing in
  the code knows the folder names.
- **Files to download** (a credential PDF, an original scan, the CV) live in `public/` and the CMS
  writes their URL, such as `/certs/cs50-ai-2022.pdf`: served as they are, under their own name, so
  a shared link survives a new upload. A field reads it with `download()`, which the loader
  (`src/content.config.ts`) builds like `image()`: the path must start with the folder the CMS
  uploads that collection's files to (`files.public_folder` in `src/admin/collections.json`). The
  model adds the type check (`downloadTypes`, also the CMS's `accept`). A wrong folder or type
  fails while content loads, with the record and field named.

  That the file exists is checked while pages render, by `downloadLink()` in
  `src/lib/downloads.ts` against `publicDir` from `astro:config/server`. It cannot live in the
  schema: the content cache re-parses an entry only when its own file changes, so a PDF deleted
  without editing its entry would pass. (The content config also cannot import `astro:config`.)

Where uploads go is Sveltia configuration, in Sveltia's own terms: the global folder in
`src/admin/settings.json`, and per collection `media_folder`/`public_folder` (images) and `files`
(downloads) in `src/admin/collections.json`. Each of those folders is also an asset collection in
the media picker. Moving a folder means editing that JSON and the stored paths, no code.

SVGs are rasterized when needed (`image.dangerouslyProcessSVG`): they only ever come from this
repository. The icon is served as it is for the tab and as a 180px PNG for home screens, so give an
SVG icon a `width`/`height` of at least 180.

`src/assets/media/icon.svg` is the logo (`logo.svg`) filled on a rounded tile. A `<style>` inside
it switches tile and mark to the dark pair under `prefers-color-scheme: dark`, so the tab icon
follows the browser's theme (not the site's toggle: a favicon is its own document). Rasterizers
ignore the media query, so the home-screen PNG is always the light pair, on its own tile. Its
four colours are the paper and ink tokens in hex, the one place they are copied: an icon is a
CMS asset and cannot read `tokens.css`.

`robots.txt` is built from `site` (`src/pages/robots.txt.ts`), so the domain is written once; do
not add one to `public/`.

Images are responsive by Astro's own rules (`image.layout: 'constrained'`): a component gives
`<Image>` the widest it is laid out (`width`) and, in a grid, its `sizes`; Astro writes the 1x and
2x renditions, capped at the source. Logos use `layout="fixed"`. Timeline photos and credential previews go through `Lightbox.svelte`, a melt `Dialog`:
the thumbnail is a link to the large image (it still works without JavaScript), and opening it
shows the photo at screen size with previous, next, arrow keys and Escape. The large rendition loads
only when the lightbox opens.

Sveltia resizes uploads to at most 2000px and converts them to WebP before committing. Upload the
largest original you have: astro:assets never upscales, so the source width caps how sharp the
lightbox can be. Every image field is optional; a row without photos and an outlet without a logo
(a monogram stands in) keep their layout.

## The profile README

This repository is `minh-vt/minh-vt`, so `README.md` is the GitHub profile. The part between
`<!-- site:start … -->` and `<!-- site:end -->` is generated from the site content, in English:
`src/pages/README.md.ts` builds it with the homepage's own accessors (name, `about.lead`, current
roles, the press items the homepage features, contact links) as a Markdown syntax tree,
serialized by `mdast-util-to-markdown` so content is escaped correctly, and `bun run readme` splices
`dist/README.md` into place after a build. Everything outside the markers is written by hand.

`.github/workflows/readme.yml` runs on every push to `main`, so a CMS edit, or a code change that
shapes the README, updates the profile within minutes. There is no path filter: the README depends
on code as well as content, and with `cancel-in-progress` the newest run is the one that commits,
so a run whose push lost the race to a newer commit is simply replaced. It commits only when the
section changed, as
`github-actions[bot]` with `[skip ci]`: a `GITHUB_TOKEN` push starts no workflow, and Cloudflare
Pages skips the build. Prettier ignores `README.md` so a local format cannot fight the generator.

## Cloudflare Pages behaviour the site relies on

- 404s: Pages answers a missing URL with the nearest `404.html` up its path. `src/pages/404.astro`
  is the default locale's page; Astro treats only that file as the 404 page, so it is also what
  `astro dev` and `astro preview` show. `src/pages/[...lang]/404.astro` builds the other locales,
  and the `locale-not-found` step in `astro.config.mjs` moves each from `<lang>/404/index.html` to
  `<lang>/404.html`, so on Pages `/en/missing` gets the English page. Both render
  `NotFound.astro`.

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

### CMS sign-in

Sveltia's GitHub sign-in needs an OAuth server, and its default is Netlify's, which knows nothing
about a Cloudflare site ("Not Found"). `backend.base_url` in `src/admin/settings.json` points at
our own Sveltia CMS Authenticator worker instead, backed by a GitHub App installed on the repo.

### Custom domain

The zone for `minhvt.id.vn` is already on Cloudflare, which is the one requirement for an apex
domain. In the Pages project: **Custom domains → Set up a domain → minhvt.id.vn**. Cloudflare
creates the apex CNAME itself through CNAME flattening; do not add the record by hand first. Add
`www` as a second custom domain if both should resolve.
https://developers.cloudflare.com/pages/configuration/custom-domains/

## Before going live

1. `site` in `astro.config.mjs`; canonical URLs, the sitemap and `robots.txt` follow it.
2. `backend.repo` and `backend.base_url` (the OAuth worker) in `src/admin/settings.json` if the
   repository or the auth worker changes.
3. Run `bun run check` and `bun run build`, then inspect production output in a browser:
   both themes/locales, mobile menu, the copy-email button, previews and article math.

## CMS contract

`src/content/model.ts` is the single source: field types, requiredness, defaults, enums,
relationships and asset kinds. Editor text (labels, hints) stays in `src/admin/labels.json`,
keyed by field name, and a missing label is a build error rather than a guessed name.

`src/content/model.ts` imports nothing from `src/admin/`: the contract describes data, never
editor vocabulary. `src/admin/` reads the JSON Schema exported by Zod and adds Vietnamese labels,
so the dependency only ever points from admin to contract.

`src/admin/fields.ts` emits fields typed by the `@sveltia/cms` package rather than a hand-written
field shape, and `src/admin/config.ts` assembles a `CmsConfig`. `/admin/` bundles the editor from
the installed `@sveltia/cms` package (`CMS.init()`), so the editor and its types are one version
and nothing loads from a CDN. Unsupported shapes throw during the build instead of degrading to
`any`. A collection with translatable fields gets Sveltia's `single_file` i18n, and those fields
`i18n: true`; summaries refer to fields by name (`{{fields.title}}`).

Relationships (`refs`, `credentials`, `outlet`, `credential`) become Sveltia Relation pickers, so
editors choose an entry instead of typing its id. `output.omit_empty_optional_fields` keeps saved
files free of empty optional keys, matching the schema.

UI strings keep their dotted keys. The CMS uses a root `keyvalue` field for these files, because
dots and `*` are invalid CMS field names.

The homepage loads references and credentials once, then passes them to fact/work accessors.
Unknown reference, outlet or credential ids fail with the owning entry named. The `credential` field in
`about` frontmatter is kept in the schema but no longer rendered on the homepage. Standalone
MDX previews load one credential with `getEntry`, not the whole collection. Display row types are
inferred from accessors instead of repeating collection fields.
