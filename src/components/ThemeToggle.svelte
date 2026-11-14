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
  class="btn btn-ghost btn-square"
  aria-label={label}
  title={isDark ? lightLabel : darkLabel}
>
  <span class={isDark ? 'i-ph-sun' : 'i-ph-moon'} aria-hidden="true"></span>
</button>
