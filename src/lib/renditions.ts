import type { ImageMetadata } from 'astro'
import { getImage } from 'astro:assets'

/** One encoded image at several widths, for markup rendered outside Astro. */
async function rendition(
  image: ImageMetadata,
  options: { width: number; sizes: string } | { layout: 'full-width'; sizes: string },
) {
  const result = await getImage({ src: image, ...options })
  return {
    src: result.src,
    srcset: result.srcSet.attribute,
    sizes: options.sizes,
    width: image.width,
    height: image.height,
  }
}

/**
 * A thumbnail for the page and a large version for the lightbox, per photo.
 * `thumb` is the widest the thumbnail is laid out and its `sizes`; Astro picks
 * the widths. The large version loads only when the lightbox opens.
 */
export async function lightboxPhotos(
  images: ImageMetadata[],
  alt: string,
  thumb: { width: number; sizes: string },
) {
  return Promise.all(
    images.map(async (image) => ({
      alt,
      thumb: await rendition(image, thumb),
      full: await rendition(image, { layout: 'full-width', sizes: '92vw' }),
    })),
  )
}
export type LightboxPhoto = Awaited<ReturnType<typeof lightboxPhotos>>[number]
