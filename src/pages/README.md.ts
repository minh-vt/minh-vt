import type { Paragraph, PhrasingContent, RootContent } from 'mdast'
import { toMarkdown } from 'mdast-util-to-markdown'
import type { Lang } from '@/i18n/locales'
import { formatDate } from '@/i18n/format'
import { pathFor, useTranslations } from '@/i18n/utils'
import {
  getAbout,
  getCurrentRoles,
  getReferences,
  pickFeatured,
  pressOf,
} from '@/lib/content'
import { absolute } from '@/lib/seo'
import { sections, siteFor } from '@/lib/site'

/**
 * The generated part of README.md, the GitHub profile page of minh-vt. It is
 * built from the same content as the homepage, in English for GitHub's
 * readers; .github/workflows/readme.yml splices it into README.md between the
 * `site:start` and `site:end` markers whenever main changes. The text is a
 * Markdown syntax tree serialized by mdast-util-to-markdown, which escapes
 * whatever the content contains.
 */
const lang: Lang = 'en'

const text = (value: string): PhrasingContent => ({ type: 'text', value })
const link = (label: string, url: string): PhrasingContent => ({
  type: 'link',
  url,
  children: [text(label)],
})
/** Items joined with a middle dot, as on the site. */
const dotted = (items: PhrasingContent[]) =>
  items.flatMap((item, index) => (index === 0 ? [item] : [text(' · '), item]))
const paragraph = (children: PhrasingContent[]): Paragraph => ({
  type: 'paragraph',
  children,
})
const label = (value: string) => paragraph([{ type: 'strong', children: [text(value)] }])
const list = (items: PhrasingContent[][]): RootContent => ({
  type: 'list',
  ordered: false,
  spread: false,
  children: items.map((children) => ({
    type: 'listItem',
    spread: false,
    children: [paragraph(children)],
  })),
})

export async function GET() {
  const t = useTranslations(lang)
  const site = siteFor(lang)
  const home = absolute(pathFor(lang))
  const about = await getAbout(lang)
  const roles = await getCurrentRoles(lang)
  // As many press items as the homepage shows, chosen the same way.
  const limit = sections.find((section) => section.type === 'press')?.limit
  const press = pressOf(await getReferences(lang))
  const featured = limit ? pickFeatured(press, limit, (ref) => ref.featured) : []

  const blocks: RootContent[] = [
    { type: 'heading', depth: 1, children: [text(site.name)] },
    paragraph([text(about.entry.data.lead)]),
    ...(roles.length > 0
      ? [
          label(t('hero.now')),
          list(
            roles.map((role) => [
              text(`${role.role}, `),
              role.url ? link(role.org, role.url) : text(role.org),
            ]),
          ),
        ]
      : []),
    ...(featured.length > 0
      ? [
          label(t('area.press.title')),
          list(
            featured.map((ref) =>
              dotted([
                link(ref.title, ref.url),
                text(ref.outlet.name),
                ...(ref.date ? [text(formatDate(ref.date, lang, 'month'))] : []),
              ]),
            ),
          ),
        ]
      : []),
    label(t('section.contact')),
    paragraph(
      dotted([
        link(site.email, `mailto:${site.email}`),
        ...site.links.map((item) => link(item.label, item.url)),
      ]),
    ),
    paragraph([text(`${t('readme.site')} `), link(new URL(home).host, home)]),
  ]

  return new Response(toMarkdown({ type: 'root', children: blocks }, { bullet: '-' }), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
