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
