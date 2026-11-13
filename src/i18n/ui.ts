import vi from '@/content/strings/vi.json'
import en from '@/content/strings/en.json'
import type { Lang } from '@/i18n/locales'

/**
 * Locale list and type only. Every user-facing string lives in
 * src/content/strings/<locale>.json so it is content, editable without code.
 */
export const strings = { vi, en } satisfies Record<Lang, Record<keyof typeof vi, string>>

export type UIKey = keyof typeof vi
