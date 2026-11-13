import { defineConfig, presetIcons, presetWind4, transformerDirectives } from 'unocss'
import type { Theme } from '@unocss/preset-wind4/theme'

/**
 * Every colour and breakpoint resolves to a token declared in
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
    'on-accent': 'var(--on-accent)',
    focus: 'var(--focus)',
    field: 'var(--field)',
    'field-ink': 'var(--field-ink)',
  },
  breakpoint: {
    sm: '34em',
    md: '52em',
    lg: '72em',
  },
}

export default defineConfig({
  presets: [
    presetWind4({ preflights: { reset: true } }),
    presetIcons({
      scale: 1.15,
      extraProperties: { display: 'inline-block', 'vertical-align': 'middle' },
    }),
  ],
  transformers: [transformerDirectives()],
  theme,
  shortcuts: {
    // The one shortcut worth naming: every interactive element uses it.
    'u-focus':
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus',
  },
})
