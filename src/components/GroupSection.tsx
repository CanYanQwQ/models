import { Percent } from 'lucide-react'
import type { PlazaGroup } from '../data/catalog'
import { rateLabel } from '../lib/pricing'
import { ModelBlock } from './ModelBlock'

export function GroupSection({ group }: { group: PlazaGroup }) {
  const showRate = group.rateVerified && group.rateMultiplier !== 1

  return (
    <section
      id={`g${group.id}`}
      className="scroll-mt-16 border-t border-rule pt-11 sm:pt-12"
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-[15px] font-semibold tracking-[-0.006em] text-ink">{group.name}</h2>
          {group.description ? (
            <p className="mt-1.5 max-w-[58ch] text-[12.5px] leading-relaxed text-ink-3">
              {group.description}
            </p>
          ) : null}
          {group.rule ? (
            <p className="mt-1.5 max-w-[58ch] text-[11.5px] leading-relaxed text-ink-3">
              {group.rule}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-baseline gap-3">
          <span className="num text-[11px] text-ink-3">{group.models.length} 个模型</span>
          {showRate ? (
            <span className="inline-flex items-center gap-1 bg-accent-wash px-1.5 py-0.5 text-[10.5px] font-medium text-accent-ink">
              <Percent size={10.5} strokeWidth={2.6} aria-hidden="true" />
              <span className="num">官方价 ×{rateLabel(group.rateMultiplier)}</span>
            </span>
          ) : null}
        </div>
      </header>

      <div className="mt-1.5 divide-y divide-rule/60">
        {group.models.map((model) => (
          <ModelBlock key={model.name} group={group} model={model} />
        ))}
      </div>
    </section>
  )
}
