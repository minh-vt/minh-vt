import type { ImageMetadata } from 'astro'

/** Rendering helpers; resolving a stored path to a file is src/lib/assets.ts. */

/** One encoded image at several widths, for markup rendered outside Astro. */
type Rendition = {
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

async function rendition(
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
