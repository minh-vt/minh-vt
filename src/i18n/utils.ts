import { getRelativeLocaleUrl } from 'astro:i18n'
import { defaultLocale, locales, strings, type Lang, type UIKey } from '@/i18n/ui'

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && (locales as readonly string[]).includes(value)
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return strings[lang][key] ?? strings[defaultLocale][key]
  }
}

/** Display name of a language, which is content like any other label. */
export function languageName(lang: Lang): string {
  return useTranslations(lang)('lang.name')
}

/**
 * URL for a page in a locale. The default locale has no prefix, so "/" is
 * Vietnamese and "/en/" is English; nothing redirects.
 */
export function pathFor(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '')
  return getRelativeLocaleUrl(lang, clean)
}

/** The same page in another locale, for the language switch. */
export function switchLocalePath(pathname: string, next: Lang): string {
  const segments = pathname.split('/').filter(Boolean)
  const rest = isLang(segments[0]) ? segments.slice(1) : segments
  return pathFor(next, rest.join('/'))
}
