export type TabId = 'leaderboard' | 'partidas' | 'jugadores'

interface Tab {
  id: TabId
  label: string
  symbol: string
}

interface TabBarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

const TABS: Tab[] = [
  { id: 'leaderboard', label: 'Ranking', symbol: '🏆' },
  { id: 'partidas', label: 'Partidas', symbol: '🃏' },
  { id: 'jugadores', label: 'Jugadores', symbol: '👤' },
]

export function TabBar({ active, onChange }: TabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex border-t border-rim bg-surface-2 pb-[env(safe-area-inset-bottom)]">
      {TABS.map(tab => {
        const isActive = tab.id === active
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={[
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium uppercase tracking-wide transition-colors',
              isActive ? 'text-uno-yellow' : 'text-ink-dim hover:text-ink',
            ].join(' ')}
          >
            <span className="text-lg leading-none">{tab.symbol}</span>
            {tab.label}
          </button>
        )
      })}
    </nav>
  )
}
