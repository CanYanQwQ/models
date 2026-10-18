import type { GroupKind, PlazaGroup, PlazaModel } from '../data/catalog'

const PER_MILLION = 1_000_000

/**
 * Money formatting for a tariff sheet: two decimals, three when rounding to
 * two would misstate the figure by more than one percent ($0.008, $0.034).
 */
export function amount(value: number): string {
  if (!Number.isFinite(value) || value < 0) return '—'
  if (value === 0) return '0'
  const rounded = Math.round(value * 100) / 100
  const decimals = Math.abs(rounded - value) / value > 0.01 ? 3 : 2
  return value.toFixed(decimals)
}

export function usd(value: number): string {
  return `$${amount(value)}`
}

/** Sell price for a per-token price: channel price × rate, quoted per 1M. */
export function perMillion(base: number | undefined, rate: number): string {
  if (base === undefined) return '—'
  return usd(base * PER_MILLION * rate)
}

/** Sell price for a per-request price (images): × rate, no per-million step. */
export function perRequest(base: number | undefined, rate: number): string {
  if (base === undefined) return '—'
  return usd(base * rate)
}

export function rateLabel(rate: number): string {
  return String(rate)
}

/* -------------------------------- data cells ------------------------------ */

/**
 * One figure in a block's price row: the number you read first and the word
 * that says what it buys, underneath — the rhythm r4.codes/models uses for
 * `$3` over `Input`.
 */
export interface Cell {
  value: string
  /** Unit suffix set smaller beside the value, e.g. `/ 1M`. */
  unit?: string
  label: string
}

/**
 * A model's whole price group. `subs` is the long-context tier, kept in its own
 * aligned row rather than nested under individual figures: a per-figure extra
 * line would push some labels down and break the horizontal scan that makes a
 * dozen blocks comparable.
 */
export interface PriceBlock {
  cells: Cell[]
  /** Tier marker printed once, in front of the first second-line figure. */
  subLabel?: string
  subs?: string[]
}

/**
 * The prices a customer pays, per tier. Tiered models show the base tier as
 * the headline figure and the long-context tier on a second line, because
 * Sub2API bills that tier per whole request — quoting one blended number would
 * understate the bill.
 */
export function priceBlock(model: PlazaModel, rate: number, kind: GroupKind): PriceBlock {
  const base = model.tiers[0]
  if (!base) return { cells: [] }

  if (kind === 'free') {
    // Three cells rather than one wide "免费": the row keeps the same rhythm as
    // every other block, and the three labels say what is being zeroed.
    return { cells: ['输入', '输出', '缓存读'].map((label) => ({ value: '$0', label })) }
  }

  if (kind === 'image') {
    return {
      cells: model.tiers.map((tier) => ({
        value: perRequest(tier.perImage, rate),
        unit: '/ 张',
        label: tier.label,
      })),
    }
  }

  const cells: Cell[] = [
    { value: perMillion(base.input, rate), unit: '/ 1M', label: '输入' },
    { value: perMillion(base.output, rate), unit: '/ 1M', label: '输出' },
    { value: perMillion(base.cacheRead, rate), unit: '/ 1M', label: '缓存读' },
  ]

  const long = model.tiers[1]
  if (!long) return { cells }

  return {
    cells,
    subLabel: long.label,
    subs: [
      perMillion(long.input, rate),
      perMillion(long.output, rate),
      perMillion(long.cacheRead, rate),
    ],
  }
}

/**
 * The span of entry-tier prices inside a group, for the section header: one
 * line that says what the group costs before you read its blocks. Uses the
 * models currently visible, so it narrows with the search box.
 */
export function priceRange(group: PlazaGroup): string {
  if (group.kind === 'free') return '免费'

  const values = group.models
    .map((model) => {
      const tier = model.tiers[0]
      if (!tier) return undefined
      if (tier.perImage !== undefined) return tier.perImage * group.rateMultiplier
      return (tier.input ?? 0) * PER_MILLION * group.rateMultiplier
    })
    .filter((value): value is number => value !== undefined)

  if (values.length === 0) return '—'
  const min = Math.min(...values)
  const max = Math.max(...values)

  // The figure is always the entry tier of the entry unit, so name it: a bare
  // "$0.34 – $1.70" could be read as output or blended pricing. The unit doubles
  // as the name for images, so it is not printed twice.
  const image = group.kind === 'image'
  const what = image ? '每张' : '输入'
  const unit = image ? '' : ' / 1M'
  const span = min === max ? `${usd(min)}` : `${usd(min)} – ${usd(max)}`
  return `${what} ${span}${unit}`
}
