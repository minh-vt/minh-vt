import raw from '@/content/site.json'
import home from '@/content/home.json'
import { schemas } from '@/content/model'
import { siteFile, siteImage } from '@/lib/assets'

const parsed = schemas.site.parse(raw)

/** Site details from the CMS; referenced files are checked on every build. */
export const site = {
  ...parsed,
  icon: siteImage(parsed.icon, 'site icon'),
  portrait: parsed.portrait ? siteImage(parsed.portrait, 'site portrait') : undefined,
  shareImage: parsed.shareImage
    ? siteImage(parsed.shareImage, 'site shareImage')
    : undefined,
  cv: parsed.cv && siteFile(parsed.cv, 'site cv'),
}

/** Sizes the large name to its length (see --text-monument in tokens.css). */
export function monumentFit(name: string) {
  const longestWord = Math.max(...name.split(/\s+/).map((word) => word.length))
  return `--name-chars: ${name.length}; --word-chars: ${longestWord}`
}

/** Homepage sections in editor order. */
export const sections = schemas.home.parse(home).sections
