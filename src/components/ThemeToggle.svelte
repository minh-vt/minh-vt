<script lang="ts">
  import { onMount } from 'svelte'

  type Theme = 'light' | 'dark'

  let {
    label,
    lightLabel,
    darkLabel,
  }: {
    label: string
    lightLabel: string
    darkLabel: string
  } = $props()

  let theme = $state<Theme>('light')

  onMount(() => {
    theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
  })

  function toggle() {
    theme = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme
    try {
      localStorage.setItem('theme', theme)
    } catch {
      // Private mode: the theme simply will not persist.
    }
  }
</script>

<button
  type="button"
  onclick={toggle}
  aria-label={label}
  aria-pressed={theme === 'dark'}
  title={theme === 'dark' ? lightLabel : darkLabel}
  class="u-focus flex size-7 items-center justify-center rounded-pill border border-line text-ink-muted transition-colors duration-200 hover:border-line-strong hover:text-ink"
>
  <svg
    class="size-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.6"
    aria-hidden="true"
  >
    {#if theme === 'dark'}
      <circle cx="12" cy="12" r="4.2" />
      <path
        d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.4 5.4l1.6 1.6M17 17l1.6 1.6M18.6 5.4L17 7M7 17l-1.6 1.6"
      />
    {:else}
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
    {/if}
  </svg>
</button>
