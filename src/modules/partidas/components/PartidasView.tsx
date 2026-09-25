import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/core/store/hooks'
import { fetchPlayers } from '@/modules/jugadores'
import { fetchMatches } from '../services/partidasSlice'
import { AddMatchModal } from './AddMatchModal'
import { MatchCard } from './MatchCard'

export function PartidasView() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector(state => state.partidas)
  const [modalOpen, setModalOpen] = useState(false)

  useEffect(() => {
    dispatch(fetchMatches())
    dispatch(fetchPlayers())
  }, [dispatch])

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-ink">Partidas</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="rounded-xl bg-uno-blue px-4 py-2 text-sm font-semibold text-white"
        >
          + Nueva
        </button>
      </div>

      {error && (
        <p className="rounded-xl border border-uno-red/40 bg-uno-red/10 px-4 py-2 text-sm text-uno-red-bright">
          {error}
        </p>
      )}

      {status === 'loading' && items.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-dim">Cargando partidas…</p>
      )}

      {status !== 'loading' && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-rim px-4 py-8 text-center text-sm text-ink-dim">
          Todavía no hay partidas registradas.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {items.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {modalOpen && <AddMatchModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
