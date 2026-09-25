import { useState } from 'react'
import { useAppDispatch } from '@/core/store/hooks'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { removePlayer, renamePlayer } from '../services/jugadoresSlice'
import type { Player } from '../types/jugadoresTypes'

interface Props {
  player: Player
}

export function PlayerCard({ player }: Props) {
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

  return (
    <>
      <div className="flex items-center gap-3 rounded-2xl border border-rim bg-surface-3 px-4 py-3">
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
