/**
 * `?embed=1` marks the sheet as rendered inside another page's overlay (the
 * homepage that embeds it). The host already supplies a title bar and a close
 * affordance, so this page drops its own header and its "back to site" link
 * instead of stacking a second set of chrome inside the first.
 *
 * Read once from the URL: it never changes for the lifetime of the document,
 * so callers may branch on it freely.
 */
export function isEmbedded(): boolean {
  try {
    return new URLSearchParams(window.location.search).get('embed') === '1'
  } catch {
    return false
  }
}

/** Message the host page listens for when it owns the overlay around this page. */
export const CLOSE_HOST_MESSAGE = 'sub2api:price-close'

/**
 * Escape belongs to whoever owns the overlay. Once the reader clicks in here,
 * keyboard focus moves into this document and the host stops receiving keys, so
 * its Escape handler goes dead — hand the key back instead of leaving a control
 * that works only until the first click.
 *
 * Returns a cleanup function; a no-op when not embedded.
 */
export function closeHostOnEscape(): () => void {
  if (!isEmbedded()) return () => {}
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'Escape' || event.defaultPrevented) return
    // The host is cross-origin, so no concrete targetOrigin is reachable from
    // here. The host validates event.origin against the sheet's own origin.
    window.parent.postMessage({ type: CLOSE_HOST_MESSAGE }, '*')
  }
  window.addEventListener('keydown', onKeyDown)
  return () => window.removeEventListener('keydown', onKeyDown)
}
