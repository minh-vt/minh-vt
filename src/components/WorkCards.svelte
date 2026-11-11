<script lang="ts">
  import CredentialCard from '@/components/CredentialCard.svelte'
  import type { WorkRow } from '@/lib/content'
  import type { Lang } from '@/i18n/ui'
  import { useTranslations } from '@/i18n/utils'

  let { cards, lang }: { cards: WorkRow[]; lang: Lang } = $props()
  const t = $derived(useTranslations(lang))
</script>

<ul class="mt-4 grid gap-x-8 gap-y-0 md:grid-cols-2">
  {#each cards as card (card.id)}
    <li class="min-w-0 border-t border-line py-6">
      {#if card.cover}
        <img
          src={card.cover}
          alt={card.title}
          width="960"
          height="540"
          loading="lazy"
          decoding="async"
          class="mb-4 aspect-video w-full border border-line object-contain"
        />
      {/if}
      <div class="flex items-baseline justify-between gap-4">
        <h3 class="t-title">{card.title}</h3>
        <span class="t-year shrink-0">{card.year}</span>
      </div>
      <p class="mt-3 text-ink-muted">{card.summary}</p>
      {#if card.metric}<p class="t-metric mt-3">{card.metric}</p>{/if}
      <p class="t-meta mt-3">{card.tech}</p>
      {#if card.refs.length > 0}
        <ul class="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {#each card.refs as ref (ref.id)}
            {@const label = t(ref.data.url.includes('/pull/') ? 'work.pr' : 'work.code')}
            <li>
              <a
                href={ref.data.url}
                class="u-focus u-link t-meta underline decoration-line-strong hover:text-accent"
                rel="noreferrer"
                aria-label={`${label}: ${card.title}`}
              >
                {label}
                <span class="i-ph-arrow-up-right size-3" aria-hidden="true"></span>
              </a>
            </li>
          {/each}
        </ul>
      {/if}
      {#if card.credentials.length > 0}
        <details class="mt-2">
          <summary class="u-focus cursor-pointer py-3 t-meta hover:text-accent"
            >{t('nav.certs')}</summary
          >
          {#each card.credentials as item (item.id)}
            <div class="mt-3 max-w-xs"><CredentialCard {item} {lang} /></div>
          {/each}
        </details>
      {/if}
    </li>
  {/each}
</ul>
