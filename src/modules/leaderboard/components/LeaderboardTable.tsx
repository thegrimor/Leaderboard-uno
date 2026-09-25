import type { LeaderboardEntry } from '../types/leaderboardTypes'

interface Props {
  entries: LeaderboardEntry[]
}

const MEDALS = ['🥇', '🥈', '🥉']

export function LeaderboardTable({ entries }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {entries.map((entry, idx) => (
        <div
          key={entry.playerId}
          className="flex items-center gap-3 rounded-2xl border border-rim bg-surface-3 px-4 py-3"
        >
          <span className="flex w-7 shrink-0 justify-center font-display text-base font-bold text-ink-dim">
            {MEDALS[idx] ?? idx + 1}
          </span>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-ink">{entry.playerName}</p>
            <p className="text-xs text-ink-dim">
              {entry.matchesPlayed} {entry.matchesPlayed === 1 ? 'partida' : 'partidas'}
              {entry.avgScore != null ? ` · ${entry.avgScore.toFixed(1)} pts prom.` : ''}
            </p>
          </div>

          <div className="text-right">
            <p className="font-display text-base font-bold text-uno-yellow">{entry.wins}</p>
            <p className="text-xs text-ink-dim">{(entry.winRate * 100).toFixed(0)}% victorias</p>
          </div>
        </div>
      ))}
    </div>
  )
}
