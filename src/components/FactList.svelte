<script lang="ts">
  import FactRow from '@/components/FactRow.svelte'
  import type { FactRow as Row } from '@/lib/content'
  import type { Lang } from '@/i18n/ui'

  let { rows, lang, hint }: { rows: Row[]; lang: Lang; hint: string } = $props()
</script>

<ol class="mt-2">
  {#each rows as row (row.id)}
    <FactRow {row} {lang} />
  {/each}
</ol>
<p class="t-meta mt-4">{hint}</p>
