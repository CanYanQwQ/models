/**
 * The mark: a ledger of rows with one cell filled in — the price column.
 *
 * Drawn rather than picked from an icon set, because the page's own grammar is
 * ruled rows plus a right-aligned figure. Monoline at 1.6/24 so it holds up at
 * 18px next to the title, and still reads as "a row with a value" at 16px.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect
        x="2.75"
        y="2.75"
        width="18.5"
        height="18.5"
        rx="4"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M6.5 8.4h11M6.5 12.1h11M6.5 15.9h4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <rect x="13.1" y="14.3" width="4.4" height="3.2" rx="1" fill="currentColor" />
    </svg>
  )
}
