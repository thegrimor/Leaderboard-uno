import { useState } from 'react'
import { useAppDispatch } from '@/core/store/hooks'
import { ConfirmModal } from '@/shared/components/ConfirmModal'
import { removeMatch } from '../services/partidasSlice'
import type { Match } from '../types/partidasTypes'

interface Props {
  match: Match
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function topEater(match: Match) {
  return match.players.reduce<Match['players'][number] | null>((top, p) => {
    if (p.cardsEaten == null || p.cardsEaten <= 0) return top
    if (!top || p.cardsEaten > (top.cardsEaten ?? 0)) return p
    return top
  }, null)
}

export function MatchCard({ match }: Props) {
  const dispatch = useAppDispatch()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const winner = match.players.find(p => p.isWinner)
  const eater = topEater(match)

  return (
    <>
      <div className="rounded-2xl border border-rim bg-surface-3 px-4 py-3.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-wide text-ink-dim">{formatDate(match.playedAt)}</span>
          <button
            onClick={() => setConfirmOpen(true)}
            className="text-xs font-medium text-ink-dim hover:text-uno-red-bright"
          >
            Eliminar
          </button>
        </div>

        {winner && (
          <p className="mt-1.5 flex items-center gap-1.5 font-display text-sm font-bold text-uno-yellow">
            🏆 {winner.playerName}
          </p>
        )}

        {eater && (
          <p className="mt-0.5 flex items-center gap-1.5 text-xs text-uno-red-bright">
            🃏 {eater.playerName} se comió {eater.cardsEaten} cartas
          </p>
        )}

        <div className="mt-2 flex flex-wrap gap-1.5">
          {match.players.map(p => (
            <span
              key={p.playerId}
              className={[
                'rounded-full border px-2.5 py-1 text-xs',
                p.isWinner
                  ? 'border-uno-yellow/50 bg-uno-yellow/10 text-uno-yellow'
                  : 'border-rim bg-surface-4 text-ink-dim',
              ].join(' ')}
            >
              {p.playerName}
              {p.cardsEaten != null ? ` · 🃏${p.cardsEaten}` : ''}
            </span>
          ))}
        </div>

        {match.notes && <p className="mt-2 text-sm text-ink-dim">{match.notes}</p>}
      </div>

      <ConfirmModal
        isOpen={confirmOpen}
        title="Eliminar partida"
        message="¿Eliminar esta partida del historial? Esta acción no se puede deshacer."
        confirmLabel="Eliminar"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false)
          dispatch(removeMatch(match.id))
        }}
      />
    </>
  )
}
