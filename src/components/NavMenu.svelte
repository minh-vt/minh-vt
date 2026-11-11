<script lang="ts">
  import { Collapsible } from 'melt/builders'
  import { onMount } from 'svelte'

  let {
    links,
    label,
  }: {
    links: { href: string; label: string }[]
    label: string
  } = $props()

  let ready = $state(false)
  onMount(() => {
    ready = true
  })
  let open = $state(false)
  let trigger: HTMLButtonElement
  const menu = new Collapsible({ open: () => open, onOpenChange: (v) => (open = v) })

  function close(event: KeyboardEvent) {
    if (event.key !== 'Escape' || !open) return
    event.preventDefault()
    open = false
    trigger.focus()
  }
</script>

<svelte:window onkeydown={close} />

<button
  {...menu.trigger}
  disabled={!ready}
  bind:this={trigger}
  class="u-press u-focus flex size-11 items-center justify-center border border-line text-ink-muted hover:border-line-strong hover:text-ink"
  aria-label={label}
>
  <svg
    viewBox="0 0 24 24"
    class="size-4"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    aria-hidden="true"
  >
    {#if open}
      <path d="M5 5l14 14M19 5L5 19" />
    {:else}
      <path d="M4 7h16M4 12h16M4 17h16" />
    {/if}
  </svg>
</button>

{#if open}
  <nav
    {...menu.content}
    aria-label={label}
    class="absolute inset-x-0 top-full max-h-[calc(100dvh-4rem)] overflow-y-auto border-b border-line bg-paper"
  >
    <ul class="u-wrap py-3">
      {#each links as link (link.href)}
        <li class="border-t border-line first:border-t-0">
          <a
            href={link.href}
            class="u-focus block py-3 text-ink hover:text-accent"
            onclick={() => (open = false)}
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
{/if}
