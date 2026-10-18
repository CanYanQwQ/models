const FALLBACK_ORIGIN = 'https://ai.zhouwanx.top'

/**
 * The Sub2API instance that hosts this page. Inside the custom-page iframe the
 * parent sends `Referrer-Policy: strict-origin-when-cross-origin`, which leaves
 * exactly the parent origin in `document.referrer` — enough to build "back to
 * site" links without any configuration. Opened directly, we fall back to the
 * known instance.
 */
export function siteOrigin(): string {
  try {
    const referrer = document.referrer
    if (referrer) {
      const url = new URL(referrer)
      if (url.protocol === 'http:' || url.protocol === 'https:') return url.origin
    }
  } catch {
    /* fall through to the configured origin */
  }
  return FALLBACK_ORIGIN
}

export function siteHost(origin: string): string {
  try {
    return new URL(origin).host
  } catch {
    return origin
  }
}
