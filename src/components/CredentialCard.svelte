<script lang="ts">
  import type { CredentialRow } from '@/lib/content'
  import { useTranslations } from '@/i18n/utils'
  import type { Lang } from '@/i18n/ui'

  let { item, lang }: { item: CredentialRow; lang: Lang } = $props()
  const t = $derived(useTranslations(lang))
</script>

<a href={item.file} class="u-focus preview-card block text-ink">
  <span class="block aspect-[4/3] overflow-hidden border border-line bg-paper-raised p-3">
    <img
      src={item.preview}
      alt=""
      width="960"
      height="720"
      loading="lazy"
      decoding="async"
      class="size-full object-contain"
    />
  </span>
  <span class="mt-3 block t-title">{item.title}</span>
  <span class="t-meta mt-1 block">{item.issuer}</span>
</a>
{#if item.extra}
  <a
    href={item.extra}
    class="u-focus u-link t-meta mt-1 underline decoration-line-strong hover:text-accent"
  >
    {t('certs.extra')}
    <span class="i-ph-arrow-up-right size-3" aria-hidden="true"></span>
  </a>
{/if}

<style>
  .preview-card {
    color: var(--ink);
    text-decoration: none;
  }

  .preview-card img {
    margin: 0;
  }

  @media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference) {
    .preview-card img {
      transition: transform var(--duration-ui) var(--ease-out);
    }

    .preview-card:hover img {
      transform: scale(1.02);
    }
  }
</style>
