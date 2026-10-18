import type { PlazaGroup } from '../data/catalog'

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

/* ------------------------------ entry price ------------------------------ */

function lowestUnitPrice(group: PlazaGroup): number {
  const values = group.models.flatMap((model) =>
    model.tiers
      .map((tier) => (group.kind === 'image' ? tier.perImage : tier.input))
      .filter((value): value is number => typeof value === 'number'),
  )
  return values.length > 0 ? Math.min(...values) : Number.POSITIVE_INFINITY
}

/** The cheapest thing in a group, at the price you actually pay. */
export function entryPrice(group: PlazaGroup): { value: string; unit: string } {
  const base = lowestUnitPrice(group)
  if (!Number.isFinite(base)) return { value: '—', unit: '' }

  if (group.kind === 'image') {
    return { value: usd(base * group.rateMultiplier), unit: '/ 张' }
  }
  if (base === 0) {
    return { value: '免费', unit: '' }
  }
  return { value: usd(base * PER_MILLION * group.rateMultiplier), unit: '/ 1M' }
}
