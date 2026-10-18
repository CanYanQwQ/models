import { ArrowUpRight, Moon, Sun } from 'lucide-react'
import { Mark } from './Mark'
import { siteOrigin } from '../lib/site'
import { useTheme } from '../lib/theme'

export function TopBar() {
  const { theme, toggle } = useTheme()
  const site = siteOrigin()

  return (
    <header className="sticky top-0 z-30 border-b border-rule bg-paper">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8">
        <div className="flex min-w-0 items-center gap-2.5">
          <Mark className="h-[18px] w-[18px] shrink-0 text-accent" />
          <span className="truncate text-[13.5px] font-semibold tracking-tight text-ink">
            模型广场
          </span>
          <span className="hidden font-mono text-[11px] text-ink-3 sm:inline">/ models</span>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={toggle}
            aria-label={theme === 'dark' ? '切换到浅色主题' : '切换到深色主题'}
            className="grid h-8 w-8 place-items-center border border-rule text-ink-2 transition-colors hover:border-rule-strong hover:text-ink"
          >
            {theme === 'dark' ? (
              <Sun size={15} strokeWidth={1.8} aria-hidden="true" />
            ) : (
              <Moon size={15} strokeWidth={1.8} aria-hidden="true" />
            )}
          </button>

          <a
            href={site}
            target="_top"
            aria-label="返回站点"
            className="group inline-flex h-8 items-center gap-1.5 border border-rule px-2.5 text-[12.5px] font-medium text-ink-2 transition-colors hover:border-rule-strong hover:text-ink"
          >
            <span className="sm:hidden">站点</span>
            <span className="hidden sm:inline">返回站点</span>
            <ArrowUpRight
              size={13}
              strokeWidth={2}
              aria-hidden="true"
              className="transition-transform group-hover:-translate-y-px group-hover:translate-x-px"
            />
          </a>
        </div>
      </div>
    </header>
  )
}
