import { useState } from 'react'
import { TabBar } from '@/shared/components/TabBar'
import type { TabId } from '@/shared/components/TabBar'
import { JugadoresView } from '@/modules/jugadores'
import { PartidasView } from '@/modules/partidas'
import { LeaderboardView } from '@/modules/leaderboard'

const VIEWS: Record<TabId, React.ComponentType> = {
  leaderboard: LeaderboardView,
  partidas: PartidasView,
  jugadores: JugadoresView,
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('leaderboard')
  const ActiveView = VIEWS[activeTab]

  return (
    <div className="min-h-dvh bg-surface">
      <header className="sticky top-0 z-20 border-b border-rim bg-surface-2">
        <div className="mx-auto flex max-w-lg items-center gap-2 px-4 py-3">
          <span className="text-xl">🃏</span>
          <span className="font-display text-base font-bold text-ink">UNO Office Edition</span>
        </div>
      </header>

      <main className="relative z-10 pb-24">
        <ActiveView />
      </main>

      <TabBar active={activeTab} onChange={setActiveTab} />
    </div>
  )
}
