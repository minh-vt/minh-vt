import { defaultLang, ui, type Lang, type UIKey } from './ui'

const locales = Object.keys(ui) as Lang[]

export function isLang(value: string | undefined): value is Lang {
  return value !== undefined && locales.includes(value as Lang)
}

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key]
  }
}

/** Path for a locale, without a trailing slash except on the locale root. */
export function localePath(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '')
  return clean ? `/${lang}/${clean}` : `/${lang}/`
}

/**
 * Maps the current pathname to the same page in another locale.
 * /vi/blog/abc -> /en/blog/abc
 */
export function switchLocalePath(pathname: string, next: Lang): string {
  const segments = pathname.split('/').filter(Boolean)
  const rest = isLang(segments[0]) ? segments.slice(1) : segments
  return localePath(next, rest.join('/'))
}
