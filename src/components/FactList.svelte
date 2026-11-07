<script lang="ts">
  import FactRow from '@/components/FactRow.svelte'

  type Ref = {
    entry: { id: string; data: { url: string; label?: string; date?: Date } }
    outlet: { id: string; data: { name: Record<string, string>; logo?: string } }
  }

  type Row = {
    id: string
    year: string
    title: string
    summary: string
    metric?: string
    refs: Ref[]
  }

  let { rows, lang, hint }: { rows: Row[]; lang: string; hint: string } = $props()
</script>

<ol class="mt-2">
  {#each rows as row (row.id)}
    <FactRow {row} {lang} />
  {/each}
</ol>
<p class="t-meta mt-4">{hint}</p>
