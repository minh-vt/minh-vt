import type { Lang } from '@/i18n/locales'

/**
 * Dates are calendar dates, not instants. They are formatted in UTC so the
 * build machine's timezone cannot shift a published date by a day.
 */
const locales: Record<Lang, string> = { vi: 'vi-VN', en: 'en-GB' }

const presets = {
  short: { year: 'numeric', month: 'short' },
  long: { year: 'numeric', month: 'long', day: 'numeric' },
  numeric: { year: 'numeric', month: '2-digit', day: '2-digit' },
  monthYear: { year: 'numeric', month: '2-digit' },
} satisfies Record<string, Intl.DateTimeFormatOptions>

export function formatDate(date: Date, lang: Lang, preset: keyof typeof presets): string {
  return new Intl.DateTimeFormat(locales[lang], {
    timeZone: 'UTC',
    ...presets[preset],
  }).format(date)
}
