<script lang="ts">
  import { onMount } from 'svelte'
  import gsap from 'gsap'

  type Card = {
    id: string
    year: string
    title: string
    summary: string
    metric?: string
    tech: string
    refs: {
      entry: { data: { url: string; title: string } }
      outlet: { data: { name: Record<string, string> } }
    }[]
  }

  let { cards }: { cards: Card[] } = $props()

  let root: HTMLElement

  onMount(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return

    const ctx = gsap.context(() => {
      gsap.from('[data-card]', {
        y: 24,
        opacity: 0,
        duration: 0.5,
        ease: 'power3.out',
        stagger: 0.06,
        scrollTrigger: { trigger: root, start: 'top 85%', once: true },
      })
    }, root)

    return () => ctx.revert()
  })
</script>

<ul class="mt-2 grid gap-x-8 gap-y-0 md:grid-cols-2" bind:this={root}>
  {#each cards as card (card.id)}
    <li data-card class="group border-t border-line py-5">
      <div class="flex items-baseline justify-between gap-4">
        <h3 class="t-title">{card.title}</h3>
        <span class="t-year shrink-0">{card.year}</span>
      </div>

      <p class="mt-2 text-ink-muted">{card.summary}</p>

      {#if card.metric}
        <p class="t-metric mt-2">{card.metric}</p>
      {/if}

      <p class="t-meta mt-3">{card.tech}</p>

      {#if card.refs.length > 0}
        <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-2">
          {#each card.refs as ref (ref.entry.data.url)}
            <li>
              <a
                href={ref.entry.data.url}
                class="u-focus t-meta inline-flex items-center gap-1 underline decoration-line underline-offset-4 hover:text-accent"
                rel="noreferrer"
              >
                Code
                <span class="i-ph-arrow-up-right size-3" aria-hidden="true"></span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
    </li>
  {/each}
</ul>
