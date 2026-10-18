import { useMemo, useState } from 'react'
import { SearchX } from 'lucide-react'
import { GROUPS, type GroupKind, type PlazaGroup } from './data/catalog'
import { FilterBar, type FilterKind } from './components/FilterBar'
import { Footer } from './components/Footer'
import { GroupIndex } from './components/GroupIndex'
import { GroupPlate } from './components/GroupPlate'
import { Hero } from './components/Hero'
import { TopBar } from './components/TopBar'

function narrow(groups: PlazaGroup[], kind: FilterKind, query: string): PlazaGroup[] {
  const needle = query.trim().toLowerCase()
  return groups
    .filter((group) => kind === 'all' || group.kind === kind)
    .map((group) => ({
      ...group,
      models: needle
        ? group.models.filter((model) => model.name.toLowerCase().includes(needle))
        : group.models,
    }))
    .filter((group) => group.models.length > 0)
}

function countByKind(kind: GroupKind): number {
  return GROUPS.filter((group) => group.kind === kind).reduce(
    (total, group) => total + group.models.length,
    0,
  )
}

export default function App() {
  const [kind, setKind] = useState<FilterKind>('all')
  const [query, setQuery] = useState('')

  const visible = useMemo(() => narrow(GROUPS, kind, query), [kind, query])

  const counts = useMemo<Record<FilterKind, number>>(
    () => ({
      all: GROUPS.reduce((total, group) => total + group.models.length, 0),
      chat: countByKind('chat'),
      image: countByKind('image'),
      free: countByKind('free'),
    }),
    [],
  )

  const filtering = kind !== 'all' || query.trim() !== ''
  const shown = visible.reduce((total, group) => total + group.models.length, 0)

  return (
    <div className="min-h-screen bg-paper">
      <TopBar />

      <main className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <Hero groupCount={GROUPS.length} modelCount={counts.all} />

        <div className="mt-8">
          <GroupIndex groups={GROUPS} />
        </div>

        <FilterBar
          kind={kind}
          query={query}
          counts={counts}
          onKind={setKind}
          onQuery={setQuery}
        />

        {visible.length > 0 ? (
          <>
            <div className="mt-6 space-y-5">
              {visible.map((group) => (
                <GroupPlate key={group.id} group={group} />
              ))}
            </div>
            {filtering ? (
              <p className="mt-4 text-[11.5px] text-ink-3">已筛出 {shown} 个模型。</p>
            ) : null}
          </>
        ) : (
          <div className="mt-6 flex flex-col items-start gap-3 border border-rule bg-sheet px-5 py-10">
            <SearchX size={20} strokeWidth={1.6} aria-hidden="true" className="text-ink-3" />
            <p className="text-[13.5px] text-ink-2">没有匹配的模型。换个关键词，或看全部分组。</p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setKind('all')
              }}
              className="border border-rule px-2.5 py-1.5 text-[12.5px] font-medium text-ink transition-colors hover:border-rule-strong"
            >
              重置筛选
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
