import { ArrowUpRight } from 'lucide-react'
import { UPDATED_AT } from '../data/catalog'
import { siteHost, siteOrigin } from '../lib/site'

export function Footer() {
  const site = siteOrigin()

  return (
    <footer className="mt-14 border-t border-rule">
      <div className="mx-auto flex max-w-[1120px] flex-col gap-5 px-5 py-8 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <div className="max-w-[62ch] space-y-1.5 text-[12px] leading-relaxed text-ink-3">
          <p>
            价格为实付价：按 token 计费的模型分输入、输出、缓存读三项，单位为每 1M tokens；图片按张计费。
          </p>
          <p>
            倍率仅在该分组的标价与官方价一致时展示，此时标价 × 倍率即实付价；其余分组只列出实付价。
          </p>
          <p className="num pt-1">更新于 {UPDATED_AT}</p>
        </div>

        <a
          href={site}
          target="_top"
          className="group inline-flex items-center gap-1.5 self-start text-[12.5px] font-medium text-ink-2 transition-colors hover:text-ink sm:self-auto"
        >
          <span className="font-mono text-[12px]">{siteHost(site)}</span>
          <ArrowUpRight
            size={13}
            strokeWidth={2}
            aria-hidden="true"
            className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
          />
        </a>
      </div>
    </footer>
  )
}
