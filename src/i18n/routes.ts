import { defaultLocale, locales } from '@/i18n/ui'

export type LocaleParams = { params: { lang?: string } }

/**
 * Route params for every locale, from one file.
 *
 * The default locale has no prefix, so its `lang` param is undefined and the
 * page lands at "/". Every other locale lands at "/<locale>/". Adding a
 * language is an edit to `locales`, never a new route file.
 */
export function localeParams(): LocaleParams[] {
  return [
    { params: { lang: undefined } },
    ...locales
      .filter((locale) => locale !== defaultLocale)
      .map((locale) => ({ params: { lang: locale as string } })),
  ]
}

/** Non-default locales, for routes that also need a second list of params. */
export function otherLocales() {
  return locales.filter((locale) => locale !== defaultLocale)
}
