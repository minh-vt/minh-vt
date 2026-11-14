<script lang="ts">
  import LinkIcon from '@/components/LinkIcon.svelte'
  import Sheet from '@/components/Sheet.svelte'
  import type { linkKinds } from '@/content/model'

  let {
    links,
    social,
    labels,
  }: {
    links: { href: string; label: string; current?: 'page' }[]
    social: { kind: (typeof linkKinds)[number]; label: string; url: string }[]
    labels: { open: string; close: string }
  } = $props()
</script>

<Sheet label={labels.open} closeLabel={labels.close}>
  {#snippet trigger(props)}
    <button {...props} class="btn btn-ghost btn-square" aria-label={labels.open}>
      <span class="i-ph-list" aria-hidden="true"></span>
    </button>
  {/snippet}

  {#snippet children(close)}
    <ul class="mt-2">
      {#each links as link (link.href)}
        <li class="border-t border-line first:border-t-0">
          <a
            href={link.href}
            aria-current={link.current}
            class="sheet-link t-section block py-3 text-ink"
            onclick={close}
          >
            {link.label}
          </a>
        </li>
      {/each}
    </ul>

    {#if social.length > 0}
      <ul class="mt-4 flex flex-wrap gap-x-5 border-t border-line pt-2">
        {#each social as item (item.url)}
          <li>
            <a href={item.url} rel="me" class="link">
              <LinkIcon kind={item.kind} />
              {item.label}
            </a>
          </li>
        {/each}
      </ul>
    {/if}
  {/snippet}
</Sheet>
