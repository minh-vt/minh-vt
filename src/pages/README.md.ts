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
 * `site:start` and `site:end` markers whenever content changes.
 */
const lang: Lang = 'en'

/** Text from content, safe inside Markdown link text and lists. */
const md = (text: string) => text.replace(/([\\`*_[\]<>|])/g, '\\$1')
const link = (label: string, url: string) => `[${md(label)}](${url})`

export async function GET() {
  const t = useTranslations(lang)
  const site = siteFor(lang)
  const about = await getAbout(lang)
  const roles = await getCurrentRoles(lang)
  // As many press items as the homepage shows, chosen the same way.
  const limit = sections.find((section) => section.type === 'press')?.limit
  const press = pressOf(await getReferences(lang))
  const featured = limit ? pickFeatured(press, limit, (ref) => ref.featured) : []

  const lines = [
    `# ${md(site.name)}`,
    '',
    md(about.entry.data.lead),
    '',
    ...(roles.length > 0
      ? [
          `**${t('hero.now')}**`,
          '',
          ...roles.map(
            (role) =>
              `- ${md(role.role)}, ${role.url ? link(role.org, role.url) : md(role.org)}`,
          ),
          '',
        ]
      : []),
    ...(featured.length > 0
      ? [
          `**${t('area.press.title')}**`,
          '',
          ...featured.map((ref) =>
            [
              `- ${link(ref.title, ref.url)}`,
              md(ref.outlet.name),
              ...(ref.date ? [formatDate(ref.date, lang, 'month')] : []),
            ].join(' · '),
          ),
          '',
        ]
      : []),
    `**${t('section.contact')}**`,
    '',
    [
      link(site.email, `mailto:${site.email}`),
      ...site.links.map((item) => link(item.label, item.url)),
    ].join(' · '),
    '',
    `${t('readme.site')} ${link(new URL(absolute(pathFor(lang))).host, absolute(pathFor(lang)))}`,
  ]

  return new Response(`${lines.join('\n')}\n`, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
