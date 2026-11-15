/**
 * Layout breakpoints in em, defined once. UnoCSS builds sm:/md:/lg: from them,
 * global.css uses them through @screen, and markup uses these helpers for
 * client:media and image `sizes`, so a breakpoint cannot drift between them.
 */
export const breakpoints = { sm: 34, md: 52, lg: 72 } as const
type Breakpoint = keyof typeof breakpoints

/** The viewport is at least this wide. */
export const from = (name: Breakpoint) => `(min-width: ${breakpoints[name]}em)`

/** The viewport is narrower than this. */
export const below = (name: Breakpoint) => `(width < ${breakpoints[name]}em)`
