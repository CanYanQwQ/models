import { Search, X } from 'lucide-react'
import type { PlazaGroup } from '../data/catalog'
import type { FilterState } from '../lib/filters'
import { groupEnabled, platformEnabled, platformsOf, rateEnabled, ratesOf } from '../lib/filters'
import { chipClass } from '../lib/chip'
import { rateLabel } from '../lib/pricing'

/**
 * The four faceted rows Sub2API puts above its plaza
 * (`PlazaFilterBar.vue`: platform / group / rate / model name), rebuilt with
 * this sheet's tokens — square hairline chips instead of tinted rounded ones,
 * and no gradient on the active state.
 */
const PLATFORM_LABELS: Record<string, string> = {
  openai: 'OpenAI',
  anthropic: 'Anthropic',
  gemini: 'Gemini',
  antigravity: 'Antigravity',
  grok: 'Grok',
  deepseek: 'DeepSeek',
  kimi: 'Kimi',
  zhipu: 'Zhipu',
  minimax: 'MiniMax',
  kiro: 'Kiro',
  cline: 'Cline',
  'opencode-go': 'OpenCode Go',
  'command-code': 'Command Code',
  typesafe: 'TypeSafe',
  composite: 'Composite',
}

function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform] ?? platform
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="w-11 shrink-0 pt-[7px] text-[11px] text-ink-3">{label}</span>
      <div className="flex flex-wrap items-center gap-1.5">{children}</div>
    </div>
  )
}

export function FilterBar({
  groups,
  state,
  onChange,
}: {
  groups: PlazaGroup[]
  state: FilterState
  onChange: (next: FilterState) => void
}) {
  const platforms = platformsOf(groups)
  const rates = ratesOf(groups)

  return (
    <div className="space-y-2.5 border-y border-rule py-4">
      {/* The plaza keeps its platform row even when every group is on one
          platform, and so do we — the four-row block is the shape people
          recognise. */}
      <Row label="平台">
        <button
          type="button"
          className={chipClass(state.platform === 'all')}
          onClick={() => onChange({ ...state, platform: 'all' })}
        >
          全部
        </button>
        {platforms.map((platform) => (
          <button
            key={platform}
            type="button"
            className={chipClass(state.platform === platform, platformEnabled(groups, state, platform))}
            disabled={!platformEnabled(groups, state, platform)}
            onClick={() => onChange({ ...state, platform })}
          >
            {platformLabel(platform)}
          </button>
        ))}
      </Row>

      <Row label="分组">
        <button
          type="button"
          className={chipClass(state.groupId === 'all')}
          onClick={() => onChange({ ...state, groupId: 'all' })}
        >
          全部
        </button>
        {groups.map((group) => (
          <button
            key={group.id}
            type="button"
            className={chipClass(state.groupId === group.id, groupEnabled(state, group))}
            disabled={!groupEnabled(state, group)}
            onClick={() => onChange({ ...state, groupId: group.id })}
          >
            {group.name}
            <span className="num text-[10.5px] opacity-60">{group.models.length}</span>
          </button>
        ))}
      </Row>

      <Row label="倍率">
        <button
          type="button"
          className={chipClass(state.rate === 'all')}
          onClick={() => onChange({ ...state, rate: 'all' })}
        >
          全部
        </button>
        {rates.map((rate) => (
          <button
            key={rate}
            type="button"
            className={chipClass(state.rate === rate, rateEnabled(groups, state, rate))}
            disabled={!rateEnabled(groups, state, rate)}
            onClick={() => onChange({ ...state, rate })}
          >
            <span className="num">×{rateLabel(rate)}</span>
          </button>
        ))}
      </Row>

      <Row label="模型名">
        <div className="relative w-full sm:w-64">
          <Search
            size={13}
            strokeWidth={2}
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-3"
          />
          <input
            type="text"
            value={state.search}
            placeholder="搜索模型"
            aria-label="搜索模型"
            onChange={(event) => onChange({ ...state, search: event.target.value })}
            className="h-7 w-full border border-rule bg-transparent pr-8 pl-8 text-[12px] text-ink transition-colors placeholder:text-ink-3 hover:border-rule-strong focus:border-ink focus:outline-none"
          />
          {state.search ? (
            <button
              type="button"
              aria-label="清除搜索"
              onClick={() => onChange({ ...state, search: '' })}
              className="absolute top-1/2 right-2 -translate-y-1/2 text-ink-3 transition-colors hover:text-ink"
            >
              <X size={13} strokeWidth={2.2} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </Row>
    </div>
  )
}
