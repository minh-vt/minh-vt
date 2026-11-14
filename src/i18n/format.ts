import type { Lang } from '@/i18n/locales'

/**
 * Dates are calendar dates, not instants. They are formatted in UTC so the
 * build machine's timezone cannot shift a published date by a day.
 */
const locales: Record<Lang, string> = { vi: 'vi-VN', en: 'en-GB' }

/** One format for every list, one for the page of a single item. */
const presets = {
  month: { year: 'numeric', month: 'long' },
  day: { year: 'numeric', month: 'long', day: 'numeric' },
} satisfies Record<string, Intl.DateTimeFormatOptions>

export function formatDate(date: Date, lang: Lang, preset: keyof typeof presets): string {
  return new Intl.DateTimeFormat(locales[lang], {
    timeZone: 'UTC',
    ...presets[preset],
  }).format(date)
}
