/**
 * Runs `update` now and then at most once per frame while the page scrolls or
 * resizes. Every scroll-linked behaviour on the site is a simple toggle, so the
 * browser's own events are enough; no animation library is loaded for them.
 */
export function onScroll(update: () => void) {
  let queued = false
  const schedule = () => {
    if (queued) return
    queued = true
    requestAnimationFrame(() => {
      queued = false
      update()
    })
  }
  window.addEventListener('scroll', schedule, { passive: true })
  window.addEventListener('resize', schedule, { passive: true })
  update()
}

/** Marks one link as the current location and clears the rest. */
export function markCurrent(
  links: Iterable<HTMLElement>,
  isCurrent: (link: HTMLElement) => boolean,
) {
  for (const link of links) {
    if (isCurrent(link)) link.setAttribute('aria-current', 'location')
    else link.removeAttribute('aria-current')
  }
}
