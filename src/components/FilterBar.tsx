import { Search, X } from 'lucide-react'
import type { GroupKind } from '../data/catalog'

export type FilterKind = 'all' | GroupKind

const CHIPS: { key: FilterKind; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'chat', label: '对话' },
  { key: 'image', label: '生图' },
  { key: 'free', label: '免费' },
]

export function FilterBar({
  kind,
  query,
  counts,
  onKind,
  onQuery,
}: {
  kind: FilterKind
  query: string
  counts: Record<FilterKind, number>
  onKind: (kind: FilterKind) => void
  onQuery: (query: string) => void
}) {
  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-3">
      <div className="flex flex-wrap items-center gap-1.5">
        {CHIPS.map((chip) => {
          const active = chip.key === kind
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => onKind(chip.key)}
              aria-pressed={active}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
                active
                  ? 'bg-ink text-paper'
                  : 'border border-rule text-ink-2 hover:border-rule-strong hover:text-ink'
              }`}
            >
              {chip.label}
              <span className={`num text-[11px] ${active ? 'text-paper/70' : 'text-ink-3'}`}>
                {counts[chip.key]}
              </span>
            </button>
          )
        })}
      </div>

      {/* `type="text"` on purpose: a native search input draws the browser's own
          clear button, which we cannot colour — this one stays in ink. */}
      <div className="flex items-center gap-2 border border-rule bg-sheet px-2.5 py-1.5 focus-within:border-rule-strong">
        <Search size={14} strokeWidth={1.8} aria-hidden="true" className="text-ink-3" />
        <input
          type="text"
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          placeholder="搜索模型"
          aria-label="搜索模型"
          className="w-32 bg-transparent text-[12.5px] text-ink placeholder:text-ink-3 focus:outline-none sm:w-44"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQuery('')}
            aria-label="清除搜索"
            className="grid h-4 w-4 shrink-0 place-items-center text-ink-3 transition-colors hover:text-ink"
          >
            <X size={12} strokeWidth={2.2} aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </div>
  )
}
