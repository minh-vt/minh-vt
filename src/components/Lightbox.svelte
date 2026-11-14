<script lang="ts">
  import { Dialog } from 'melt/builders'
  import { onMount } from 'svelte'
  import type { LightboxPhoto } from '@/lib/images'

  let {
    photos,
    labels,
  }: {
    photos: LightboxPhoto[]
    labels: { zoom: string; close: string; previous: string; next: string }
  } = $props()

  // melt owns focus, Escape, outside clicks and the scroll lock. The native
  // dialog returns focus to the thumbnail that opened it.
  const dialog = new Dialog()
  let index = $state(0)
  let ready = $state(false)
  const current = $derived(photos[index])
  const many = $derived(photos.length > 1)

  onMount(() => {
    ready = true
  })

  // Without JavaScript a thumbnail is a plain link to the large image.
  function open(event: MouseEvent, at: number) {
    if (!ready) return
    event.preventDefault()
    index = at
    dialog.open = true
  }

  const step = (by: number) => (index = (index + by + photos.length) % photos.length)

  function onkeydown(event: KeyboardEvent) {
    if (!dialog.open || !many) return
    if (event.key === 'ArrowRight') step(1)
    if (event.key === 'ArrowLeft') step(-1)
  }
</script>

<svelte:window {onkeydown} />

<ul class="grid grid-cols-2 gap-2">
  {#each photos as photo, at (photo.full.src)}
    <li class:col-span-2={at === 0}>
      <a
        href={photo.full.src}
        class="lightbox-thumb group relative block"
        onclick={(event) => open(event, at)}
      >
        <img
          src={photo.thumb.src}
          srcset={photo.thumb.srcset}
          sizes={photo.thumb.sizes}
          width={photo.thumb.width}
          height={photo.thumb.height}
          alt={photo.alt}
          loading="lazy"
          decoding="async"
          class="aspect-[4/3] w-full border border-line bg-paper-raised object-cover"
        />
        <span class="btn btn-square u-glass absolute right-2 bottom-2" aria-hidden="true">
          <span class="i-ph-magnifying-glass-plus"></span>
        </span>
        <span class="sr-only">{labels.zoom}</span>
      </a>
    </li>
  {/each}
</ul>

<dialog {...dialog.content} class="lightbox" aria-label={current.alt}>
  <button
    type="button"
    class="btn btn-ghost btn-square absolute top-3 right-3"
    aria-label={labels.close}
    onclick={() => (dialog.open = false)}
  >
    <span class="i-ph-x" aria-hidden="true"></span>
  </button>

  <figure class="flex h-full flex-col items-center justify-center gap-4 p-4 pt-16">
    <img
      src={current.full.src}
      srcset={current.full.srcset}
      sizes={current.full.sizes}
      width={current.full.width}
      height={current.full.height}
      alt={current.alt}
      loading="lazy"
      decoding="async"
      class="lightbox-image"
    />
    <figcaption class="flex w-full max-w-3xl items-center justify-between gap-4">
      {#if many}
        <button
          type="button"
          class="btn btn-ghost btn-square"
          aria-label={labels.previous}
          onclick={() => step(-1)}
        >
          <span class="i-ph-arrow-left" aria-hidden="true"></span>
        </button>
      {/if}
      <span class="t-meta flex-1 text-center">
        {current.alt}{many ? ` · ${index + 1}/${photos.length}` : ''}
      </span>
      {#if many}
        <button
          type="button"
          class="btn btn-ghost btn-square"
          aria-label={labels.next}
          onclick={() => step(1)}
        >
          <span class="i-ph-arrow-right" aria-hidden="true"></span>
        </button>
      {/if}
    </figcaption>
  </figure>
</dialog>
