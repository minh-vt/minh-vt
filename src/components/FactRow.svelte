<script lang="ts">
  import { Collapsible } from 'melt/builders'
  import { onMount } from 'svelte'
  import CredentialCard from '@/components/CredentialCard.svelte'
  import OutletMark from '@/components/OutletMark.svelte'
  import { local } from '@/i18n/utils'
  import type { FactRow, Reference } from '@/lib/content'
  import type { Lang } from '@/i18n/ui'

  let {
    row,
    lang,
  }: {
    row: FactRow
    lang: Lang
  } = $props()

  let ready = $state(false)
  onMount(() => {
    ready = true
  })
  let open = $state(false)
  const collapsible = new Collapsible({
    open: () => open,
    onOpenChange: (v) => (open = v),
  })

  const nameOf = (outlet: Reference['outlet']) => local(outlet.data.name, lang)
  const monthYear = (date: Date) =>
    `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
</script>

<li class="border-b border-line">
  <button
    {...collapsible.trigger}
    disabled={!ready}
    class="u-focus bar-summary grid w-full grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-0.5 py-4 text-left md:grid-cols-[6rem_1fr_auto]"
  >
    <span class="t-year col-span-2 md:col-span-1">{row.year}</span>
    <span class="t-title">{row.title}</span>
    <span class="t-year" aria-hidden="true">{open ? '−' : '+'}</span>
  </button>

  <div {...collapsible.content} class="grid gap-x-4 gap-y-3 md:grid-cols-[6rem_1fr]">
    {#if open}
      <span class="hidden md:block"></span>
      <div class="pb-6">
        <p class="u-measure">{row.summary}</p>
        {#if row.metric}
          <p class="t-metric mt-2">{row.metric}</p>
        {/if}
        {#if row.refs.length > 0}
          <ul class="mt-3 flex flex-col gap-2">
            {#each row.refs as ref (ref.id)}
              <li>
                <a
                  href={ref.data.url}
                  class="u-focus u-link text-ink-muted hover:text-accent"
                  rel="noreferrer"
                >
                  <OutletMark outlet={ref.outlet} {lang} />
                  <span class="t-meta">
                    {ref.data.label ?? nameOf(ref.outlet)}
                    {ref.data.date ? ` · ${monthYear(ref.data.date)}` : ''}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
        {#each row.credentials as item (item.id)}
          <div class="mt-5 max-w-xs"><CredentialCard {item} {lang} /></div>
        {/each}
      </div>
    {/if}
  </div>
</li>
