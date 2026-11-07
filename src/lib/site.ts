import type { Lang } from '../i18n/ui'

export const site = {
  email: 'vuminh.work@gmail.com',
  github: 'https://github.com/minh-vt',
  linkedin: 'https://linkedin.com/in/minh-vt',
  repo: 'https://github.com/minh-vt/minh-vt',
  location: {
    vi: 'TP. Hồ Chí Minh · Phú Yên',
    en: 'Ho Chi Minh City · Phu Yen',
  } satisfies Record<Lang, string>,
} as const
