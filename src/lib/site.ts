import raw from '@/content/site.json'
import home from '@/content/home.json'
import { schemas } from '@/content/model'
import { publicFile } from '@/lib/files'
import { siteImage } from '@/lib/images'

const parsed = schemas.site.parse(raw)

/** Site details from the CMS; referenced files are checked on every build. */
export const site = {
  ...parsed,
  portrait: parsed.portrait ? siteImage(parsed.portrait, 'site portrait') : undefined,
  shareImage: parsed.shareImage
    ? siteImage(parsed.shareImage, 'site shareImage')
    : undefined,
  cv: parsed.cv && publicFile(parsed.cv, 'site cv'),
}

/** Homepage sections in editor order. */
export const sections = schemas.home.parse(home).sections
