import { Percent } from 'lucide-react'
import type { GroupKind, PlazaGroup } from '../data/catalog'
import { perMillion, perRequest, rateLabel } from '../lib/pricing'

interface Column {
  key: 'model' | 'tier' | 'input' | 'output' | 'cache' | 'perImage' | 'billing'
  label: string
  /** Class string, not a style: table-fixed widths have to re-break on phones. */
  width: string
  align: 'left' | 'right'
  /** Dropped below `sm` so the prices that remain still fit a 390px screen. */
  compact?: boolean
}

const CELL = 'px-3 py-2.5 sm:px-5'

function columnsFor(kind: GroupKind, hasTier: boolean): Column[] {
  if (kind === 'free') {
    return [
      { key: 'model', label: '模型', width: 'w-[68%]', align: 'left' },
      { key: 'billing', label: '计费', width: 'w-[32%]', align: 'right' },
    ]
  }

  if (kind === 'image') {
    return [
      { key: 'model', label: '模型', width: 'w-[46%]', align: 'left' },
      { key: 'tier', label: '档位', width: 'w-[26%]', align: 'left' },
      { key: 'perImage', label: '每张', width: 'w-[28%]', align: 'right' },
    ]
  }

  if (hasTier) {
    return [
      { key: 'model', label: '模型', width: 'w-[40%] sm:w-[32%]', align: 'left' },
      { key: 'tier', label: '上下文', width: 'w-[24%] sm:w-[15%]', align: 'left' },
      { key: 'input', label: '输入', width: 'w-[18%]', align: 'right' },
      { key: 'output', label: '输出', width: 'w-[18%]', align: 'right' },
      { key: 'cache', label: '缓存读', width: 'w-[17%]', align: 'right', compact: true },
    ]
  }

  return [
    { key: 'model', label: '模型', width: 'w-[48%] sm:w-[40%]', align: 'left' },
    { key: 'input', label: '输入', width: 'w-[26%] sm:w-[20%]', align: 'right' },
    { key: 'output', label: '输出', width: 'w-[26%] sm:w-[20%]', align: 'right' },
    { key: 'cache', label: '缓存读', width: 'w-[20%]', align: 'right', compact: true },
  ]
}

export function GroupPlate({ group }: { group: PlazaGroup }) {
  const showRate = group.rateVerified && group.rateMultiplier !== 1

  return (
    <section id={`g${group.id}`} className="scroll-mt-20 border border-rule bg-sheet">
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2 border-b border-rule px-4 py-4 sm:px-5">
        <div className="min-w-0">
          <h2 className="text-[17px] text-ink sm:text-[18px]">{group.name}</h2>
          {group.description ? (
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{group.description}</p>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-2.5 pt-0.5">
          {showRate ? (
            <span className="inline-flex items-center gap-1 border border-accent/30 bg-accent-wash px-1.5 py-0.5 text-[11px] font-medium text-accent-ink">
              <Percent size={11} strokeWidth={2.4} aria-hidden="true" />
              <span className="num">官方价 ×{rateLabel(group.rateMultiplier)}</span>
            </span>
          ) : null}
          <span className="num text-[11px] text-ink-3">{group.models.length} 个模型</span>
        </div>
      </header>

      <PriceTable group={group} />
    </section>
  )
}

function PriceTable({ group }: { group: PlazaGroup }) {
  const isImage = group.kind === 'image'
  const isFree = group.kind === 'free'
  const hasTier = isImage || group.models.some((model) => model.tiers.length > 1)
  const columns = columnsFor(group.kind, hasTier)

  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-[13px]">
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`${column.width} ${CELL} py-2 text-[11px] font-medium text-ink-3 ${
                  column.align === 'right' ? 'text-right' : 'text-left'
                } ${column.compact ? 'hidden sm:table-cell' : ''}`}
              >
                {column.label}
                {column.key === 'input' || column.key === 'output' || column.key === 'cache' ? (
                  <span className="hidden font-normal sm:inline"> /1M</span>
                ) : null}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {group.models.map((model) =>
            model.tiers.map((tier, index) => (
              <tr
                key={`${model.name}-${tier.label}-${index}`}
                className="border-t border-rule/70 align-top transition-colors hover:bg-soft/60"
              >
                {index === 0 ? (
                  <td rowSpan={model.tiers.length} className={`${CELL} align-top`}>
                    <span className="num text-[12px] text-ink sm:text-[12.5px]">{model.name}</span>
                  </td>
                ) : null}

                {hasTier ? (
                  <td className={`${CELL} align-top`}>
                    <span className="num text-[11.5px] text-ink-2">{tier.label}</span>
                  </td>
                ) : null}

                {isFree ? (
                  <td className={`${CELL} text-right`}>
                    <span className="num text-[12px] text-accent-ink">免费</span>
                  </td>
                ) : isImage ? (
                  <td className={`${CELL} text-right`}>
                    <span className="num text-[12px] text-ink sm:text-[13px]">
                      {perRequest(tier.perImage, group.rateMultiplier)}
                    </span>
                  </td>
                ) : (
                  <>
                    <td className={`${CELL} text-right`}>
                      <span className="num text-[12px] whitespace-nowrap text-ink sm:text-[13px]">
                        {perMillion(tier.input, group.rateMultiplier)}
                      </span>
                    </td>
                    <td className={`${CELL} text-right`}>
                      <span className="num text-[12px] whitespace-nowrap text-ink sm:text-[13px]">
                        {perMillion(tier.output, group.rateMultiplier)}
                      </span>
                    </td>
                    <td className={`${CELL} hidden text-right sm:table-cell`}>
                      <span className="num text-[13px] whitespace-nowrap text-ink-2">
                        {perMillion(tier.cacheRead, group.rateMultiplier)}
                      </span>
                    </td>
                  </>
                )}
              </tr>
            )),
          )}
        </tbody>
      </table>
    </div>
  )
}
