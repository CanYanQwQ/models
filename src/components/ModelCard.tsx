import type { PriceBlock } from '../lib/pricing'
import { priceBlock } from '../lib/pricing'
import type { PlazaGroup, PlazaModel } from '../data/catalog'

/**
 * The figures of one model: numbers on the first line, their labels underneath,
 * the long-context tier on a third line behind a hairline. All three lines share
 * one column template, so a figure always sits above its own label and the tier
 * figure under the column it belongs to.
 *
 * The unit rides with the label rather than the figure (`输入 / 1M`, not
 * `$0.85 / 1M`). On a 336px card a column is only ~93px, and `$0.085 / 1M`
 * does not fit in one; moving it down also leaves the top line purely numeric,
 * which is the line the eye scans when comparing cards.
 */
function PriceGrid({ block, free }: { block: PriceBlock; free: boolean }) {
  const { cells, subLabel, subs } = block
  if (cells.length === 0) return null

  const columns = { gridTemplateColumns: `repeat(${cells.length}, minmax(0, 1fr))` }

  return (
    <div>
      <div className="grid gap-x-3 gap-y-1.5" style={columns}>
        {cells.map((cell) => (
          <div
            key={cell.label}
            className={`num text-[18px] leading-none font-medium xl:text-[19px] ${
              free ? 'text-accent-ink' : 'text-ink'
            }`}
          >
            {cell.value}
          </div>
        ))}

        {cells.map((cell) => (
          <div
            key={`${cell.label}-label`}
            className="text-[10.5px] leading-tight whitespace-nowrap text-ink-3"
          >
            {cell.label}
            {cell.unit ? <span className="ml-1 text-ink-3/60">{cell.unit}</span> : null}
          </div>
        ))}
      </div>

      {subs ? (
        <div className="mt-2.5 grid gap-x-3 border-t border-rule/60 pt-2" style={columns}>
          {subs.map((value, index) => (
            <div
              key={`sub-${index}`}
              className="num text-[10.5px] leading-tight whitespace-nowrap text-ink-2"
            >
              {index === 0 && subLabel ? <span className="mr-1 text-ink-3">{subLabel}</span> : null}
              {value}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}

/**
 * One model as a card. The card is a sheet of paper, not a floating panel:
 * square, 1px rule, no shadow and no gradient — the same hairline that divides
 * rows elsewhere now draws the frame.
 *
 * The price block is pushed to the bottom (`mt-auto`) so that in a row of cards
 * the figures share one baseline and the tier rules land at one height: the row
 * reads as a single ruled table rather than as five unrelated boxes.
 */
export function ModelCard({ group, model }: { group: PlazaGroup; model: PlazaModel }) {
  const block = priceBlock(model, group.rateMultiplier, group.kind)

  return (
    <article className="flex h-full flex-col border border-rule bg-sheet p-4 transition-colors hover:border-rule-strong">
      <h3 className="text-[15px] leading-snug font-semibold tracking-[-0.01em] text-ink">
        {model.label}
      </h3>
      <p className="num mt-0.5 text-[11px] leading-relaxed break-all text-ink-3">{model.name}</p>

      {model.note ? (
        <p className="mt-2 text-[12px] leading-relaxed text-ink-2">{model.note}</p>
      ) : null}

      <div className="mt-auto pt-4">
        <PriceGrid block={block} free={group.kind === 'free'} />
      </div>
    </article>
  )
}
