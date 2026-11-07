import {
  defineConfig,
  presetTypography,
  presetWind4,
  transformerDirectives,
} from 'unocss'
import type { Theme } from '@unocss/preset-wind4/theme'

/**
 * Every colour, radius and breakpoint resolves to a token declared in
 * src/theme/tokens.css. No component may use a raw hex, oklch() or px value.
 * The theme is typed explicitly because UnoCSS infers the theme shape from the
 * last preset in the list, which hides wind4's keys.
 */
const theme: Theme = {
  colors: {
    paper: 'var(--paper)',
    'paper-raised': 'var(--paper-raised)',
    ink: 'var(--ink)',
    'ink-muted': 'var(--ink-muted)',
    line: 'var(--line)',
    'line-strong': 'var(--line-strong)',
    accent: 'var(--accent)',
    'accent-soft': 'var(--accent-soft)',
    'on-accent': 'var(--on-accent)',
    focus: 'var(--focus)',
  },
  radius: {
    sm: 'var(--radius-sm)',
    md: 'var(--radius-md)',
    pill: 'var(--radius-pill)',
  },
  breakpoint: {
    sm: '34em',
    md: '52em',
    lg: '72em',
  },
}

export default defineConfig({
  presets: [presetTypography(), presetWind4({ preflights: { reset: true } })],
  transformers: [transformerDirectives()],
  theme,
  shortcuts: {
    'u-link':
      'text-accent underline decoration-line-strong underline-offset-4 hover:decoration-accent',
    'u-focus':
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
    'u-card': 'bg-paper-raised rounded-md',
  },
})
