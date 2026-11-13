<script lang="ts">
  import CredentialCard from '@/components/CredentialCard.svelte'
  import OutletMark from '@/components/OutletMark.svelte'
  import type { Lang } from '@/i18n/locales'
  import { formatDate } from '@/i18n/format'
  import { local } from '@/i18n/utils'
  import type { FactRow, Reference } from '@/lib/content'

  let { row, lang }: { row: FactRow; lang: Lang } = $props()

  const nameOf = (outlet: Reference['outlet']) => local(outlet.data.name, lang)
</script>

<li class="border-b border-line">
  <details>
    <summary
      class="u-focus bar-summary grid w-full cursor-pointer grid-cols-[1fr_auto] items-baseline gap-x-4 gap-y-0.5 py-4 text-left md:grid-cols-[6rem_1fr_auto]"
    >
      <span class="t-year col-span-2 md:col-span-1">{row.year}</span>
      <span class="t-title">{row.title}</span>
      <span class="t-year" aria-hidden="true">
        <span class="mark-plus">+</span>
        <span class="mark-minus">−</span>
      </span>
    </summary>

    <div class="grid gap-x-4 gap-y-3 md:grid-cols-[6rem_1fr]">
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
                    {ref.data.date
                      ? ` · ${formatDate(ref.data.date, lang, 'monthYear')}`
                      : ''}
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
    </div>
  </details>
</li>

<style>
  summary {
    list-style: none;
  }

  summary::-webkit-details-marker {
    display: none;
  }

  .mark-minus {
    display: none;
  }

  details[open] .mark-minus {
    display: inline;
  }

  details[open] .mark-plus {
    display: none;
  }
</style>
