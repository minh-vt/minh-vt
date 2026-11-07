/**
 * Colours the browser reads before any CSS exists: the theme-color meta tags.
 * They cannot reference a custom property, so they are literals here and
 * nowhere else. Keep in sync with --paper in tokens.css.
 */
export const chromeColor = {
  light: '#faf7f1',
  dark: '#191919',
} as const
