import { ArrowUpRight } from 'lucide-react'
import type { PlazaGroup } from '../data/catalog'
import { entryPrice, rateLabel } from '../lib/pricing'

/**
 * The price list's opening: four groups, what each one starts at, and the
 * multiplier where we can actually vouch for it. Every row is an anchor into
 * the detail plates, so this doubles as the page index.
 */
export function GroupIndex({ groups }: { groups: PlazaGroup[] }) {
  return (
    <section aria-labelledby="index-title" className="border border-rule bg-sheet">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-5 pb-3 pt-4">
        <h2 id="index-title" className="text-[13px] font-medium text-ink">
          分组概览
        </h2>
        <p className="text-[11px] text-ink-3">起价即该分组最便宜档位的实付价</p>
      </div>

      <div className="hidden grid-cols-[1fr_5.5rem_4rem_6rem] gap-4 border-t border-rule px-5 py-2 text-[11px] text-ink-3 sm:grid">
        <span>分组</span>
        <span className="text-right">倍率</span>
        <span className="text-right">模型</span>
        <span className="text-right">起价</span>
      </div>

      <ul className="divide-y divide-rule/70 border-t border-rule sm:border-t-0">
        {groups.map((group) => {
          const price = entryPrice(group)
          const showsRate = group.rateVerified && group.rateMultiplier !== 1

          return (
            <li key={group.id}>
              <a
                href={`#g${group.id}`}
                className="group grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-0.5 px-5 py-3 transition-colors hover:bg-soft sm:grid-cols-[1fr_5.5rem_4rem_6rem]"
              >
                <span className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-[13.5px] font-medium text-ink sm:truncate sm:min-w-0">
                    {group.name}
                  </span>
                  <ArrowUpRight
                    size={12}
                    strokeWidth={2}
                    aria-hidden="true"
                    className="shrink-0 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100"
                  />
                  {showsRate ? (
                    <span className="num shrink-0 border border-accent/30 bg-accent-wash px-1.5 py-px text-[10.5px] font-medium text-accent-ink sm:hidden">
                      ×{rateLabel(group.rateMultiplier)}
                    </span>
                  ) : null}
                </span>

                <span className="hidden text-right sm:block">
                  {showsRate ? (
                    <span className="num text-[12px] font-medium text-accent-ink">
                      ×{rateLabel(group.rateMultiplier)}
                    </span>
                  ) : (
                    <span className="num text-[12px] text-ink-3">—</span>
                  )}
                </span>

                <span className="hidden text-right sm:block">
                  <span className="num text-[12px] text-ink-3">{group.models.length}</span>
                </span>

                <span className="text-right">
                  <span className="num text-[13px] text-ink">{price.value}</span>
                  {price.unit ? (
                    <span className="ml-1 text-[10.5px] text-ink-3">{price.unit}</span>
                  ) : null}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
