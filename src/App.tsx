import { useState } from 'react'
import { SearchX } from 'lucide-react'
import { GROUPS } from './data/catalog'
import type { FilterState } from './lib/filters'
import { EMPTY_FILTERS, visibleGroups } from './lib/filters'
import { FilterBar } from './components/FilterBar'
import { Footer } from './components/Footer'
import { GroupSection } from './components/GroupSection'
import { Hero } from './components/Hero'
import { ListToolbar } from './components/ListToolbar'
import { TopBar } from './components/TopBar'

const MODEL_COUNT = GROUPS.reduce((total, group) => total + group.models.length, 0)

export default function App() {
  const [state, setState] = useState<FilterState>(EMPTY_FILTERS)
  const shown = visibleGroups(GROUPS, state)
  const shownModels = shown.reduce((total, group) => total + group.models.length, 0)

  function reset() {
    setState({ ...EMPTY_FILTERS, sort: state.sort })
  }

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />

      <main className="mx-auto max-w-[1120px] px-5 pb-4 sm:px-8">
        <Hero groupCount={GROUPS.length} modelCount={MODEL_COUNT} />

        <div className="mt-8">
          <FilterBar groups={GROUPS} state={state} onChange={setState} />
        </div>

        <ListToolbar
          modelCount={shownModels}
          groupCount={shown.length}
          state={state}
          onChange={setState}
        />

        {shown.length > 0 ? (
          <div className="space-y-9">
            {shown.map((group) => (
              <GroupSection key={group.id} group={group} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center border-t border-rule py-16 text-center">
            <SearchX size={22} strokeWidth={1.6} aria-hidden="true" className="text-ink-3" />
            <p className="mt-3 text-[13px] text-ink-2">没有匹配的模型</p>
            <p className="mt-1 text-[11.5px] text-ink-3">换个关键词，或者清空筛选条件。</p>
            <button type="button" onClick={reset} className="mt-5 text-[12px] text-ink-2 underline decoration-rule underline-offset-2 transition-colors hover:text-ink hover:decoration-ink-3">
              清空筛选
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
