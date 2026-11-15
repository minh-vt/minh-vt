import tokens from '@/theme/tokens.css?raw'

/**
 * The colour the browser paints its own bar with (theme-color meta tags).
 * Meta tags cannot read a custom property, so the value is read out of
 * tokens.css at build time; --paper stays the one place the colour is set,
 * and a renamed block or token fails the build instead of drifting.
 */
function paper(selector: string): string {
  const block = tokens.split(`${selector} {`)[1]?.split('}')[0]
  const value = block?.match(/--paper:\s*([^;]+);/)?.[1]
  if (!value) throw new Error(`tokens.css: no --paper in "${selector}"`)
  return value.trim()
}

export const chromeColor = {
  light: paper(':root'),
  dark: paper("[data-theme='dark']"),
}
