import { ArrowDownWideNarrow, RotateCcw } from 'lucide-react'
import type { FilterState, SortMode } from '../lib/filters'
import { activeFilterCount } from '../lib/filters'
import { chipClass } from '../lib/chip'

const SORTS: Array<{ value: SortMode; label: string }> = [
  { value: 'default', label: '默认' },
  { value: 'price', label: '价格从低到高' },
]

/**
 * One line between the filters and the list: how many models are showing, and
 * the one control that makes a long price sheet scannable — sort by entry
 * price instead of catalogue order.
 */
export function ListToolbar({
  modelCount,
  groupCount,
  state,
  onChange,
}: {
  modelCount: number
  groupCount: number
  state: FilterState
  onChange: (next: FilterState) => void
}) {
  const filtering = activeFilterCount(state) > 0

  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 py-3">
      <p className="num flex items-center gap-2 text-[11px] text-ink-3">
        {filtering ? (
          <>
            <span>筛出 {modelCount} 个模型</span>
            <button
              type="button"
              onClick={() => onChange({ ...state, platform: 'all', groupId: 'all', rate: 'all', search: '' })}
              className="inline-flex items-center gap-1 text-ink-2 underline decoration-rule underline-offset-2 transition-colors hover:text-ink hover:decoration-ink-3"
            >
              <RotateCcw size={10.5} strokeWidth={2.4} aria-hidden="true" />
              清除筛选
            </button>
          </>
        ) : (
          <span>
            共 {modelCount} 个模型 · {groupCount} 个分组
          </span>
        )}
      </p>

      <div className="flex items-center gap-1.5">
        <ArrowDownWideNarrow
          size={12}
          strokeWidth={2.2}
          aria-hidden="true"
          className="text-ink-3"
        />
        <span className="text-[11px] text-ink-3">排序</span>
        {SORTS.map((sort) => (
          <button
            key={sort.value}
            type="button"
            aria-pressed={state.sort === sort.value}
            className={chipClass(state.sort === sort.value)}
            onClick={() => onChange({ ...state, sort: sort.value })}
          >
            {sort.label}
          </button>
        ))}
      </div>
    </div>
  )
}
