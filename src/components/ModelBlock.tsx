import type { PriceBlock } from '../lib/pricing'
import { priceBlock } from '../lib/pricing'
import type { PlazaGroup, PlazaModel } from '../data/catalog'

/**
 * The price row, laid out as one grid: figures, their labels, then the
 * long-context tier. Using a single grid rather than a stack per column is what
 * keeps the labels on one baseline and the second-line figures under the column
 * they belong to, so the eye can run straight down the page.
 *
 * The figures are set larger than the model name on purpose: on a page with a
 * dozen models the reader is here to compare numbers, so the numbers lead and
 * the name is the caption.
 *
 * The tier line gets a hairline above it and its own grid with the same column
 * template. Without the rule it reads as a stray row belonging to the next
 * model; with a column of its own it would break the label baseline shared by
 * every other block.
 */
function PriceRow({ block, free }: { block: PriceBlock; free: boolean }) {
  const { cells, subLabel, subs } = block
  if (cells.length === 0) return null

  const columns = { gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }

  return (
    <div className="max-w-[52rem]">
      <div className="grid gap-x-4 gap-y-2 sm:gap-x-8" style={columns}>
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={`num text-[21px] leading-none font-medium sm:text-[26px] ${
              free ? 'text-accent-ink' : 'text-ink'
            }`}
          >
            {cell.value}
            {cell.unit ? (
              <span className="ml-1 text-[10.5px] font-normal tracking-normal text-ink-3">
                {cell.unit}
              </span>
            ) : null}
          </div>
        ))}

        {cells.map((cell) => (
          <div key={`${cell.label}-label`} className="text-[10.5px] text-ink-3 sm:text-[11px]">
            {cell.label}
          </div>
        ))}
      </div>

      {subs ? (
        <div
          className="mt-2.5 grid gap-x-4 border-t border-rule/60 pt-2.5 sm:gap-x-8"
          style={columns}
        >
          {subs.map((value, index) => (
            <div
              key={`sub-${index}`}
              className="num text-[10.5px] whitespace-nowrap text-ink-2 sm:text-[11px]"
            >
              {index === 0 && subLabel ? (
                <span className="mr-1.5 text-ink-3">{subLabel}</span>
              ) : null}
              {value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

export function ModelBlock({ group, model }: { group: PlazaGroup; model: PlazaModel }) {
  const block = priceBlock(model, group.rateMultiplier, group.kind)

  return (
    <article className="py-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink">{model.label}</h3>
        <span className="num text-[11.5px] text-ink-3">{model.name}</span>
      </div>

      {model.note ? (
        <p className="mt-1.5 max-w-[62ch] text-[12.5px] leading-relaxed text-ink-2">{model.note}</p>
      ) : null}

      <div className="mt-4">
        <PriceRow block={block} free={group.kind === 'free'} />
      </div>
    </article>
  )
}
