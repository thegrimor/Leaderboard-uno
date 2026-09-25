import { useState } from 'react'
import { useAppDispatch } from '@/core/store/hooks'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import type { LeaderboardEntry } from '@/modules/leaderboard'
import { removePlayer, renamePlayer } from '../services/jugadoresSlice'
import type { Player } from '../types/jugadoresTypes'

interface Props {
  player: Player
  stats?: LeaderboardEntry
}

export function PlayerCard({ player, stats }: Props) {
  const dispatch = useAppDispatch()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.name)
  const [confirmOpen, setConfirmOpen] = useState(false)

  function startEdit() {
    setName(player.name)
    setEditing(true)
  }

  async function saveEdit() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === player.name) {
      setEditing(false)
      return
    }
    const result = await dispatch(renamePlayer({ id: player.id, name: trimmed }))
    if (renamePlayer.fulfilled.match(result)) setEditing(false)
  }

  const matchesPlayed = stats?.matchesPlayed ?? 0
  const wins = stats?.wins ?? 0
  const cardsEaten = stats?.totalCardsEaten ?? 0
  const winRate = stats?.winRate ?? 0

  return (
    <>
      <div className="rounded-2xl border border-rim bg-surface-3">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-uno-red font-display text-base font-bold text-white">
            {player.name.charAt(0).toUpperCase()}
          </div>

          {editing ? (
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveEdit()}
              maxLength={40}
              className="min-w-0 flex-1 rounded-lg border border-rim-2 bg-surface-4 px-2 py-1 text-sm text-ink focus:outline-none"
            />
          ) : (
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">{player.name}</span>
          )}

          {editing ? (
            <button
              onClick={saveEdit}
              className="rounded-lg bg-uno-green px-3 py-1.5 text-xs font-semibold text-white"
            >
              Guardar
            </button>
          ) : (
            <button
              onClick={startEdit}
              className="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-dim hover:text-ink"
            >
              Editar
            </button>
          )}
          <button
            onClick={() => setConfirmOpen(true)}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-ink-dim hover:text-uno-red-bright"
          >
            Eliminar
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 border-t border-rim px-4 py-3">
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-base font-bold text-ink">{matchesPlayed}</span>
            <span className="text-[11px] uppercase tracking-wide text-ink-dim">Partidas</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-base font-bold text-uno-yellow">{wins}</span>
            <span className="text-[11px] uppercase tracking-wide text-ink-dim">Victorias</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-base font-bold text-uno-green">{(winRate * 100).toFixed(0)}%</span>
            <span className="text-[11px] uppercase tracking-wide text-ink-dim">Winrate</span>
          </div>
          <div className="flex flex-col items-center gap-0.5">
            <span className="font-display text-base font-bold text-uno-red-bright">🃏 {cardsEaten}</span>
            <span className="text-[11px] uppercase tracking-wide text-ink-dim">Comidas</span>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar jugador"
        message={`¿Eliminar a "${player.name}"? Sus partidas anteriores seguirán apareciendo en el historial de los demás jugadores.`}
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          dispatch(removePlayer(player.id))
        }}
      />
    </>
  )
}
