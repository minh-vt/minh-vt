<script lang="ts">
  import { Collapsible } from 'melt/builders'

  type Ref = {
    entry: { id: string; data: { url: string; label?: string; date?: Date } }
    outlet: { id: string; data: { name: Record<string, string>; logo?: string } }
  }

  let {
    row,
    lang,
  }: {
    row: {
      id: string
      year: string
      title: string
      summary: string
      metric?: string
      refs: Ref[]
    }
    lang: string
  } = $props()

  let open = $state(false)
  const collapsible = new Collapsible({
    open: () => open,
    onOpenChange: (v) => (open = v),
  })

  const nameOf = (outlet: Ref['outlet']) => outlet.data.name[lang] ?? outlet.data.name.vi
  const monthYear = (date: Date) =>
    `${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()}`
  const monogram = (value: string) =>
    value
      .split(/\s+/)
      .filter((word) => word.length > 1)
      .slice(0, 2)
      .map((word) => word[0])
      .join('')
</script>

<li class="border-b border-line" data-reveal>
  <button
    {...collapsible.trigger}
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
            {#each row.refs as ref (ref.entry.id)}
              <li>
                <a
                  href={ref.entry.data.url}
                  class="u-focus inline-flex items-center gap-2 text-ink-muted hover:text-accent"
                  rel="noreferrer"
                >
                  {#if ref.outlet.data.logo}
                    <img
                      src={ref.outlet.data.logo}
                      alt=""
                      width="14"
                      height="14"
                      loading="lazy"
                      class="size-3.5 shrink-0"
                      aria-hidden="true"
                    />
                  {:else}
                    <span
                      class="flex size-3.5 shrink-0 items-center justify-center border border-line-strong text-[0.5625rem] leading-none text-ink-muted"
                      aria-hidden="true"
                    >
                      {monogram(nameOf(ref.outlet))}
                    </span>
                  {/if}
                  <span class="t-meta">
                    {ref.entry.data.label ?? nameOf(ref.outlet)}
                    {ref.entry.data.date ? ` · ${monthYear(ref.entry.data.date)}` : ''}
                  </span>
                </a>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    {/if}
  </div>
</li>
