import rss from '@astrojs/rss'
import type { APIContext } from 'astro'
import { routeLocale } from '@/i18n/locales'
import { localeParams } from '@/i18n/routes'
import { local, useTranslations } from '@/i18n/utils'
import { getPosts, postPath } from '@/lib/content'
import { site } from '@/lib/site'

export function getStaticPaths() {
  return localeParams()
}

/** The blog as a feed, one per locale (/rss.xml, /en/rss.xml). */
export async function GET(context: APIContext) {
  const lang = routeLocale(context.params.lang)
  const t = useTranslations(lang)
  const posts = await getPosts(lang)
  return rss({
    title: `${local(site.name, lang)} · ${t('area.blog.title')}`,
    description: t('area.blog.lead'),
    site: context.site ?? '',
    customData: `<language>${lang}</language>`,
    items: posts.map(({ entry }) => ({
      title: entry.data.title,
      description: entry.data.description,
      pubDate: entry.data.date,
      link: postPath(lang, entry.id),
      categories: entry.data.tags,
    })),
  })
}
