import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/core/store/hooks'
import { fetchPlayers } from '../services/jugadoresSlice'
import { AddPlayerForm } from './AddPlayerForm'
import { PlayerCard } from './PlayerCard'

export function JugadoresView() {
  const dispatch = useAppDispatch()
  const { items, status, error } = useAppSelector(state => state.jugadores)

  useEffect(() => {
    dispatch(fetchPlayers())
  }, [dispatch])

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4 px-4 py-5">
      <h1 className="font-display text-xl font-bold text-ink">Jugadores</h1>

      <AddPlayerForm />

      {error && (
        <p className="rounded-xl border border-uno-red/40 bg-uno-red/10 px-4 py-2 text-sm text-uno-red-bright">
          {error}
        </p>
      )}

      {status === 'loading' && items.length === 0 && (
        <p className="py-8 text-center text-sm text-ink-dim">Cargando jugadores…</p>
      )}

      {status !== 'loading' && items.length === 0 && (
        <p className="rounded-2xl border border-dashed border-rim px-4 py-8 text-center text-sm text-ink-dim">
          Todavía no hay jugadores. Añade el primero arriba.
        </p>
      )}

      <div className="flex flex-col gap-2">
        {items.map(player => (
          <PlayerCard key={player.id} player={player} />
        ))}
      </div>
    </div>
  )
}
