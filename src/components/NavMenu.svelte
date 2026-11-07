<script lang="ts">
  import { Collapsible } from 'melt/builders'

  let {
    links,
    label,
  }: {
    links: { href: string; label: string }[]
    label: string
  } = $props()

  let open = $state(false)
  const menu = new Collapsible({ open: () => open, onOpenChange: (v) => (open = v) })
</script>

<button
  {...menu.trigger}
  class="u-press u-focus flex size-8 items-center justify-center border border-line text-ink-muted hover:border-line-strong hover:text-ink"
  aria-label={label}
>
  <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
    {#if open}
      <path d="M5 5l14 14M19 5L5 19" />
    {:else}
      <path d="M4 7h16M4 12h16M4 17h16" />
    {/if}
  </svg>
</button>

{#if open}
  <div {...menu.content} class="absolute inset-x-0 top-full border-b border-line bg-paper">
    <ul class="u-wrap py-3">
      {#each links as link (link.href)}
        <li class="border-t border-line first:border-t-0">
          <a
            href={link.href}
            class="u-focus block py-3 t-label text-ink hover:text-accent"
            onclick={() => (open = false)}
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </div>
{/if}
