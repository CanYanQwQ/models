/** A drawn mark rather than a picture: a sheet with a value node on it. */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="1" y="1" width="18" height="18" rx="4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M5 7.25h10M5 12.25h5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="14.4" cy="12.25" r="1.6" fill="currentColor" />
    </svg>
  )
}
