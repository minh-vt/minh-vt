import vi from '@/content/strings/vi.json'
import en from '@/content/strings/en.json'

/**
 * Locale list and type only. Every user-facing string lives in
 * src/content/strings/<locale>.json so it is content, editable without code.
 */
export const locales = ['vi', 'en'] as const
export type Lang = (typeof locales)[number]
export const defaultLocale: Lang = 'vi'

export const strings = { vi, en } satisfies Record<Lang, Record<string, string>>

export type UIKey = keyof typeof vi
