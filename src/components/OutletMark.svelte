<script lang="ts">
  import { local } from '@/i18n/utils'
  import type { Lang } from '@/i18n/ui'
  import type { Reference } from '@/lib/content'

  let {
    outlet,
    lang,
    size = 'sm',
  }: {
    outlet: Reference['outlet']
    lang: Lang
    size?: 'sm' | 'md'
  } = $props()
  const name = $derived(local(outlet.data.name, lang))
  const monogram = $derived(
    name
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .slice(0, 2)
      .map((word) => word[0])
      .join(''),
  )
</script>

{#if outlet.data.logo}
  <img
    src={outlet.data.logo}
    alt=""
    width="16"
    height="16"
    loading="lazy"
    decoding="async"
    class={size === 'md' ? 'size-4 shrink-0' : 'size-3.5 shrink-0'}
    aria-hidden="true"
  />
{:else}
  <span
    class="flex shrink-0 items-center justify-center border border-line-strong text-[0.5625rem] leading-none text-ink-muted {size ===
    'md'
      ? 'size-4'
      : 'size-3.5'}"
    aria-hidden="true"
  >
    {monogram}
  </span>
{/if}
