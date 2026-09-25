import { useEffect, useMemo, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/core/store/hooks'
import { fetchPlayers } from '@/modules/jugadores'
import { fetchMatches } from '../services/partidasSlice'
import { AddMatchModal } from './AddMatchModal'
import { MatchCard } from './MatchCard'

function toDateInputValue(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function PartidasView() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector(state => state.partidas)
  const [modalOpen, setModalOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')

  useEffect(() => {
    dispatch(fetchMatches())
    dispatch(fetchPlayers())
  }, [dispatch])

  const filteredItems = useMemo(() => {
    if (!dateFrom && !dateTo) return items
    return items.filter(match => {
      const matchDate = toDateInputValue(match.playedAt)
      if (dateFrom && matchDate < dateFrom) return false
      if (dateTo && matchDate > dateTo) return false
      return true
    })
  }, [items, dateFrom, dateTo])

  const hasFilter = dateFrom !== '' || dateTo !== ''

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

      <div className="flex items-end gap-2">
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-dim">Desde</span>
          <input
            type="date"
            value={dateFrom}
            onChange={e => setDateFrom(e.target.value)}
            className="w-full rounded-xl border border-rim bg-surface-3 px-3 py-2 text-sm text-ink focus:border-rim-2 focus:outline-none"
          />
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="text-xs font-medium uppercase tracking-wide text-ink-dim">Hasta</span>
          <input
            type="date"
            value={dateTo}
            onChange={e => setDateTo(e.target.value)}
            className="w-full rounded-xl border border-rim bg-surface-3 px-3 py-2 text-sm text-ink focus:border-rim-2 focus:outline-none"
          />
        </label>
        {hasFilter && (
          <button
            onClick={() => {
              setDateFrom('')
              setDateTo('')
            }}
            className="rounded-xl border border-rim px-3 py-2 text-xs font-medium text-ink-dim hover:text-ink"
          >
            Limpiar
          </button>
        )}
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

      {status !== 'loading' && items.length > 0 && filteredItems.length === 0 && (
        <p className="rounded-2xl border border-dashed border-rim px-4 py-8 text-center text-sm text-ink-dim">
          Ninguna partida en ese rango de fechas.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {filteredItems.map(match => (
          <MatchCard key={match.id} match={match} />
        ))}
      </div>

      {modalOpen && <AddMatchModal onClose={() => setModalOpen(false)} />}
    </div>
  )
}
