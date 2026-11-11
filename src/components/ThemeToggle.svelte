<script lang="ts">
  import { Toggle } from 'melt/builders'
  import { onMount } from 'svelte'

  let {
    label,
    lightLabel,
    darkLabel,
  }: {
    label: string
    lightLabel: string
    darkLabel: string
  } = $props()

  let ready = $state(false)
  let isDark = $state(false)

  const toggle = new Toggle({
    value: () => isDark,
    onValueChange: (next) => {
      isDark = next
      document.documentElement.dataset.theme = next ? 'dark' : 'light'
      try {
        localStorage.setItem('theme', next ? 'dark' : 'light')
      } catch {
        // Private mode: the choice simply does not persist.
      }
    },
  })

  onMount(() => {
    isDark = document.documentElement.dataset.theme === 'dark'
    ready = true
  })
</script>

<button
  {...toggle.trigger}
  disabled={!ready}
  class="u-press u-focus flex size-11 items-center justify-center border border-line text-ink-muted hover:border-line-strong hover:text-ink"
  aria-label={label}
  title={isDark ? lightLabel : darkLabel}
>
  <svg
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.7"
    aria-hidden="true"
  >
    {#if isDark}
      <circle cx="12" cy="12" r="4.1" />
      <path
        d="M12 2.8v2.4M12 18.8v2.4M2.8 12h2.4M18.8 12h2.4M5.6 5.6l1.7 1.7M16.7 16.7l1.7 1.7M18.4 5.6l-1.7 1.7M7.3 16.7l-1.7 1.7"
      />
    {:else}
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
    {/if}
  </svg>
</button>
