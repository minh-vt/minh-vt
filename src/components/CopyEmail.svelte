<script lang="ts">
  import { onMount } from 'svelte'

  let {
    email,
    label,
    copiedLabel,
  }: { email: string; label: string; copiedLabel: string } = $props()

  let ready = $state(false)
  let copied = $state(false)
  let timer: ReturnType<typeof setTimeout> | undefined

  onMount(() => {
    ready = true
    return () => clearTimeout(timer)
  })

  async function copy() {
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      // Clipboard refused: the mailto link beside this button still works.
      return
    }
    copied = true
    clearTimeout(timer)
    timer = setTimeout(() => (copied = false), 1800)
  }
</script>

<button type="button" onclick={copy} disabled={!ready} class="btn">
  <span class={copied ? 'i-ph-check' : 'i-ph-copy'} aria-hidden="true"></span>
  <span aria-live="polite">{copied ? copiedLabel : label}</span>
</button>
