<script lang="ts">
  import Sheet from '@/components/Sheet.svelte'

  let {
    items,
    labels,
  }: {
    items: { slug: string; text: string; depth: number }[]
    labels: { toc: string; close: string }
  } = $props()
</script>

<!-- Phone and tablet: the contents button joins the page dock. -->
<Sheet label={labels.toc} closeLabel={labels.close}>
  {#snippet trigger(props)}
    <button {...props} class="btn u-glass">
      <span class="i-ph-list-bullets" aria-hidden="true"></span>
      {labels.toc}
    </button>
  {/snippet}

  {#snippet children(close)}
    <ol class="mt-2">
      {#each items as item (item.slug)}
        <li class:pl-4={item.depth === 3}>
          <a
            href={`#${item.slug}`}
            data-toc-link={item.slug}
            class="toc-link block py-2.5"
            onclick={close}
          >
            {item.text}
          </a>
        </li>
      {/each}
    </ol>
  {/snippet}
</Sheet>
