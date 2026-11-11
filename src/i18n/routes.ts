import { defaultLocale, isLang, locales } from '@/i18n/locales'

export const slugSegmentPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function parsePostId(id: string) {
  const [lang, ...parts] = id.split('/')
  if (
    !isLang(lang) ||
    parts.length === 0 ||
    parts.some((part) => !slugSegmentPattern.test(part))
  ) {
    throw new Error(`Invalid post id: ${id}. Expected <locale>/<slug>`)
  }
  return { lang, slug: parts.join('/') }
}

export function localeParams() {
  return locales.map((lang) => ({
    params: { lang: lang === defaultLocale ? undefined : lang },
  }))
}
