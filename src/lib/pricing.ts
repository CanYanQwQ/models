import type { GroupKind, PlazaModel } from '../data/catalog'

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
 * One figure in a block's price row: the value you read first, an optional
 * second line for the long-context tier, and the label underneath — the same
 * three-line rhythm r4.codes/models uses for `$3 / ≈ $0.5 / Input`.
 */
export interface Cell {
  value: string
  /** Unit suffix set smaller beside the value, e.g. `/ 1M`. */
  unit?: string
  /** Secondary figure, already prefixed with its tier label. */
  sub?: string
  label: string
}

/**
 * The prices a customer pays, per tier. Tiered models show the base tier as
 * the headline figure and the long-context tier on the second line, because
 * Sub2API bills that tier per whole request — quoting one blended number would
 * understate the bill.
 */
export function priceCells(model: PlazaModel, rate: number, kind: GroupKind): Cell[] {
  const base = model.tiers[0]
  if (!base) return []

  if (kind === 'free') {
    // Three cells rather than one wide "免费": the row keeps the same rhythm as
    // every other block, and the three labels say what is being zeroed.
    return ['输入', '输出', '缓存读'].map((label) => ({ value: '$0', label }))
  }

  if (kind === 'image') {
    return model.tiers.map((tier) => ({
      value: perRequest(tier.perImage, rate),
      unit: '/ 张',
      label: tier.label,
    }))
  }

  const long = model.tiers[1]
  const line = (label: string, key: 'input' | 'output' | 'cacheRead'): Cell => {
    const sub = long?.[key]
    return {
      value: perMillion(base[key], rate),
      unit: '/ 1M',
      sub: sub === undefined ? undefined : `${long?.label ?? '长上下文'} ${perMillion(sub, rate)}`,
      label,
    }
  }

  return [line('输入', 'input'), line('输出', 'output'), line('缓存读', 'cacheRead')]
}
