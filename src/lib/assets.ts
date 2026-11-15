import type { ImageMetadata } from 'astro'

/**
 * Maps a stored path such as `/media/photo.webp` to the file under src/assets/
 * (see src/content/paths.ts). Living in src/ is what lets astro:assets resize
 * images and Vite fingerprint documents at build time. A missing file fails
 * the build, on every build, not only when the content cache is cold.
 *
 * The glob patterns must be literals, so the folder is spelled out here.
 */
const images = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{avif,gif,jpeg,jpg,png,svg,webp}',
  { eager: true },
)
const documents = import.meta.glob<string>('/src/assets/**/*.pdf', {
  eager: true,
  query: '?url',
  import: 'default',
})

const source = (path: string) => `/src/assets${path}`

/** An image for astro:assets to resize and re-encode. */
export function siteImage(path: string, owner: string): ImageMetadata {
  const file = images[source(path)]
  if (!file)
    throw new Error(`${owner}: missing image "${path}" (expected src/assets${path})`)
  return file.default
}

/** A file to link to as it is: a PDF, or an image at its original size. */
export function siteFile(path: string, owner: string): string {
  const url = documents[source(path)] ?? images[source(path)]?.default.src
  if (!url)
    throw new Error(
      `${owner}: missing file "${path}" (expected a PDF or image at src/assets${path})`,
    )
  return url
}
