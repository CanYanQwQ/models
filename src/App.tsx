import { GROUPS } from './data/catalog'
import { Footer } from './components/Footer'
import { GroupSection } from './components/GroupSection'
import { Hero } from './components/Hero'
import { TopBar } from './components/TopBar'

const MODEL_COUNT = GROUPS.reduce((total, group) => total + group.models.length, 0)

export default function App() {
  return (
    <div className="min-h-screen bg-paper">
      <TopBar />

      <main className="mx-auto max-w-[1120px] px-5 pb-4 sm:px-8">
        <Hero groupCount={GROUPS.length} modelCount={MODEL_COUNT} />

        <div className="mt-11 space-y-9 sm:mt-12">
          {GROUPS.map((group) => (
            <GroupSection key={group.id} group={group} />
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
