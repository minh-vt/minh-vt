export const locales = ['vi', 'en'] as const
export type Lang = (typeof locales)[number]
export const defaultLocale: Lang = locales[0]

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && locales.some((locale) => locale === value)
}

export function routeLocale(value: string | undefined): Lang {
  if (value === undefined) return defaultLocale
  if (!isLang(value)) throw new Error(`Unsupported locale: ${value}`)
  return value
}
