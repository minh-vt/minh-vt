import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Registered once; every page script imports from here.
gsap.registerPlugin(ScrollTrigger)

export { gsap, ScrollTrigger }

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
