import type { Cell } from '../lib/pricing'
import { priceCells } from '../lib/pricing'
import type { PlazaGroup, PlazaModel } from '../data/catalog'

/**
 * One price column: the figure you read first, the long-context tier on a
 * second line, and the label underneath — the three-line rhythm r4.codes uses
 * for `$3 / ≈ $0.5 / Input`, where the middle line is a second reading of the
 * same number rather than a new field.
 */
function PriceRow({ cells, free }: { cells: Cell[]; free: boolean }) {
  if (cells.length === 0) return null

  return (
    <div
      className="grid max-w-[52rem] gap-x-4 gap-y-4 sm:gap-x-8"
      style={{ gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }}
    >
      {cells.map((cell) => (
        <div key={cell.label} className="min-w-0">
          <div
            className={`num text-[18px] leading-none sm:text-[21px] ${
              free ? 'text-accent-ink' : 'text-ink'
            }`}
          >
            {cell.value}
            {cell.unit ? (
              <span className="ml-1 text-[10.5px] tracking-normal text-ink-3">{cell.unit}</span>
            ) : null}
          </div>

          {cell.sub ? (
            <div className="num mt-1.5 text-[10.5px] whitespace-nowrap text-ink-3 sm:text-[11px]">
              {cell.sub}
            </div>
          ) : null}

          <div className="mt-2 text-[10.5px] text-ink-3 sm:text-[11px]">{cell.label}</div>
        </div>
      ))}
    </div>
  )
}

export function ModelBlock({ group, model }: { group: PlazaGroup; model: PlazaModel }) {
  const prices = priceCells(model, group.rateMultiplier, group.kind)
  const free = group.kind === 'free'

  return (
    <article className="py-5">
      <div className="flex flex-wrap items-baseline gap-x-3.5 gap-y-1">
        <h3 className="text-[18.5px] font-semibold tracking-[-0.012em] text-ink sm:text-[21px]">
          {model.label}
        </h3>
        <span className="num text-[11.5px] text-ink-3">{model.name}</span>
      </div>

      {model.note ? (
        <p className="mt-2 max-w-[62ch] text-[12.5px] leading-[1.7] text-ink-2 sm:text-[13px]">
          {model.note}
        </p>
      ) : null}

      <div className="mt-5">
        <PriceRow cells={prices} free={free} />
      </div>
    </article>
  )
}
