import raw from '@/content/site.json'
import type { Lang } from '@/i18n/ui'

/**
 * Site-wide facts that are content, not code: contact addresses and the name of
 * the places this person says they are in. Values live in src/content/site.json.
 */
export const site = {
  email: raw.email,
  github: raw.github,
  linkedin: raw.linkedin,
  location: raw.location as Record<Lang, string>,
} as const
