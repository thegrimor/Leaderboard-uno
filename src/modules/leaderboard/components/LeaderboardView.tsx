import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/core/store/hooks'
import { fetchLeaderboard } from '../services/leaderboardSlice'
import { LeaderboardTable } from './LeaderboardTable'

export function LeaderboardView() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector(state => state.leaderboard)

  useEffect(() => {
    dispatch(fetchLeaderboard())
  }, [dispatch])

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-5">
      <h1 className="font-display text-xl font-bold text-ink">Ranking</h1>

      {error && (
        <p className="rounded-xl border border-uno-red/40 bg-uno-red/10 px-4 py-2 text-sm text-uno-red-bright">
          {error}
        </p>
      )}

      {status === 'loading' && items.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-dim">Cargando ranking…</p>
      )}

      {status !== 'loading' && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-rim px-4 py-8 text-center text-sm text-ink-dim">
          Todavía no hay jugadores ni partidas para armar el ranking.
        </p>
      )}

      <LeaderboardTable entries={items} />
    </div>
  )
}
