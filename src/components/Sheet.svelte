<script lang="ts">
  import { Dialog } from 'melt/builders'
  import type { Snippet } from 'svelte'

  let {
    label,
    closeLabel,
    trigger,
    children,
  }: {
    label: string
    closeLabel: string
    /** Receives melt's trigger props to spread on the opening button. */
    trigger: Snippet<[Dialog['trigger']]>
    /** Receives `close`, for links that should dismiss the sheet. */
    children: Snippet<[() => void]>
  } = $props()

  // melt owns focus, Escape, outside clicks and the scroll lock.
  const dialog = new Dialog()
  const close = () => (dialog.open = false)
</script>

{@render trigger(dialog.trigger)}

<dialog {...dialog.content} class="sheet" aria-label={label}>
  <div class="flex items-center justify-between">
    <p class="t-label">{label}</p>
    <button
      type="button"
      class="btn btn-ghost btn-square"
      aria-label={closeLabel}
      onclick={close}
    >
      <span class="i-ph-x" aria-hidden="true"></span>
    </button>
  </div>
  {@render children(close)}
</dialog>
