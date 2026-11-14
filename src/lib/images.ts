import type { ImageMetadata } from 'astro'

/**
 * Image fields store a site path such as `/media/photo.webp`, which is what the
 * CMS writes. The files live under `src/assets/` so astro:assets can resize and
 * re-encode them at build time; this maps one to the other.
 */
const files = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{avif,gif,jpeg,jpg,png,svg,webp}',
  { eager: true },
)

/** Resolves an image path from content, failing the build when the file is missing. */
export function siteImage(path: string, owner: string): ImageMetadata {
  const file = files[`/src/assets${path}`]
  if (!file)
    throw new Error(`${owner}: missing image "${path}" (expected src/assets${path})`)
  return file.default
}

/** One encoded image at several widths, for markup rendered outside Astro. */
export type Rendition = {
  src: string
  srcset: string
  sizes: string
  width: number
  height: number
}

/** Widths never exceed the source: astro:assets does not upscale. */
export function fittingWidths(image: ImageMetadata, widths: number[]) {
  return [...widths.filter((width) => width < image.width), image.width]
}

export async function rendition(
  image: ImageMetadata,
  widths: number[],
  sizes: string,
): Promise<Rendition> {
  const { getImage } = await import('astro:assets')
  const result = await getImage({
    src: image,
    widths: fittingWidths(image, widths),
    sizes,
  })
  return {
    src: result.src,
    srcset: result.srcSet.attribute,
    sizes,
    width: image.width,
    height: image.height,
  }
}

/** A thumbnail for the page and a large version for the lightbox, per photo. */
export async function lightboxPhotos(
  images: ImageMetadata[],
  alt: string,
  thumbSizes: string,
) {
  return Promise.all(
    images.map(async (image) => ({
      alt,
      thumb: await rendition(image, [320, 480, 640, 960], thumbSizes),
      full: await rendition(image, [960, 1600, 2400], '92vw'),
    })),
  )
}
export type LightboxPhoto = Awaited<ReturnType<typeof lightboxPhotos>>[number]
