/**
 * The chip is the only control surface on this page, so its three states live
 * in one place: filters, the sort toggle and the reset button all wear it.
 * Square corners and a single hairline — no fill, no shadow, no gradient.
 */
const CHIP =
  'inline-flex h-7 items-center gap-1.5 border px-2.5 text-[12px] leading-none font-medium transition-colors'

export function chipClass(active: boolean, enabled = true): string {
  if (!enabled) return `${CHIP} cursor-not-allowed border-rule/60 text-ink-3/45`
  if (active) return `${CHIP} border-ink bg-ink text-paper`
  return `${CHIP} border-rule text-ink-2 hover:border-rule-strong hover:text-ink`
}
