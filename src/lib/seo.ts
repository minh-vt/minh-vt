import type { ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'
import { localeTags, type Lang } from '@/i18n/locales'
import { pathFor } from '@/i18n/utils'
import { siteFor } from '@/lib/site'

/** Absolute URL on the deployed origin (`site` in astro.config.mjs). */
export function absolute(path: string): string {
  return new URL(path, import.meta.env.SITE).href
}

/** Open Graph writes the same tag with an underscore (vi_VN). */
export const ogLocale = (lang: Lang) => localeTags[lang].replace('-', '_')

/**
 * The picture a link shows when shared: the page's own image, else the site's
 * share image, else the portrait; none if the CMS has none of them. Platforms
 * want JPEG or PNG, so it is re-encoded here; it is never cropped, so a wide
 * image (about 1200×630) gets the large card and a square one the small card.
 */
export async function shareImage(lang: Lang, own?: ImageMetadata) {
  const site = siteFor(lang)
  const image = own ?? site.shareImage ?? site.portrait
  if (!image) return undefined
  const result = await getImage({
    src: image,
    width: Math.min(1200, image.width),
    format: 'jpeg',
  })
  const width = Number(result.attributes.width)
  const height = Number(result.attributes.height)
  return { url: absolute(result.src), width, height, wide: width / height >= 1.5 }
}

/**
 * The person behind the site, the same object wherever it appears: as the
 * homepage's subject and as the author of every post.
 */
export function person(lang: Lang) {
  return {
    '@type': 'Person',
    '@id': `${absolute(pathFor(lang))}#person`,
    name: siteFor(lang).name,
    url: absolute(pathFor(lang)),
  }
}

/** Serialised for a <script type="application/ld+json">; `<` is escaped so a
    `</script>` inside a string cannot end the tag early. */
export function jsonLd(data: object): string {
  return JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(
    /</g,
    '\\u003c',
  )
}
