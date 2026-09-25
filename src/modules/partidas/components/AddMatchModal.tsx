import { useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/core/store/hooks'
import { Modal } from '@/shared/components/Modal'
import { addMatch } from '../services/partidasSlice'

interface Props {
  onClose: () => void
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export function AddMatchModal({ onClose }: Props) {
  const dispatch = useAppDispatch()
  const players = useAppSelector(state => state.jugadores.items)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [scores, setScores] = useState<Record<string, string>>({})
  const [winnerId, setWinnerId] = useState<string | null>(null)
  const [playedAt, setPlayedAt] = useState(todayInputValue)
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function togglePlayer(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        if (winnerId === id) setWinnerId(null)
      } else {
        next.add(id)
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)

    if (selected.size < 2) {
      setFormError('Elegí al menos 2 jugadores.')
      return
    }
    if (!winnerId || !selected.has(winnerId)) {
      setFormError('Marcá quién ganó la partida.')
      return
    }

    setSubmitting(true)
    const result = await dispatch(
      addMatch({
        playedAt: playedAt ? new Date(`${playedAt}T12:00:00`).toISOString() : undefined,
        notes: notes.trim() || undefined,
        players: Array.from(selected).map(playerId => ({
          playerId,
          score: scores[playerId]?.trim() ? Number(scores[playerId]) : null,
          isWinner: playerId === winnerId,
        })),
      }),
    )
    setSubmitting(false)

    if (addMatch.fulfilled.match(result)) {
      onClose()
    } else {
      setFormError(result.payload ?? 'No se pudo registrar la partida.')
    }
  }

  return (
    <Modal>
      <div
        className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
        style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
        onClick={onClose}
      >
        <form
          onClick={e => e.stopPropagation()}
          onSubmit={handleSubmit}
          className="flex max-h-[90dvh] w-full max-w-lg animate-pop flex-col rounded-t-3xl border border-rim bg-surface-3 sm:rounded-3xl"
        >
          <div className="flex items-center justify-between border-b border-rim px-5 py-4">
            <h2 className="font-display text-lg font-bold text-ink">Nueva partida</h2>
            <button
              type="button"
              onClick={onClose}
              className="text-2xl leading-none text-ink-dim hover:text-ink"
              aria-label="Cerrar"
            >
              ×
            </button>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-dim">Fecha</span>
              <input
                type="date"
                value={playedAt}
                onChange={e => setPlayedAt(e.target.value)}
                className="rounded-xl border border-rim bg-surface-4 px-3 py-2 text-sm text-ink focus:border-rim-2 focus:outline-none"
              />
            </label>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-dim">
                Jugadores ({selected.size} seleccionados)
              </span>
              {players.length === 0 ? (
                <p className="rounded-xl border border-dashed border-rim px-3 py-4 text-sm text-ink-dim">
                  Todavía no hay jugadores cargados. Andá a la pestaña Jugadores para añadir alguno.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {players.map(player => {
                    const isSelected = selected.has(player.id)
                    return (
                      <button
                        type="button"
                        key={player.id}
                        onClick={() => togglePlayer(player.id)}
                        className={[
                          'rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors',
                          isSelected
                            ? 'border-uno-blue bg-uno-blue/20 text-ink'
                            : 'border-rim bg-surface-4 text-ink-dim hover:text-ink',
                        ].join(' ')}
                      >
                        {player.name}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {selected.size > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium uppercase tracking-wide text-ink-dim">
                  Puntaje y ganador
                </span>
                <div className="flex flex-col divide-y divide-rim overflow-hidden rounded-xl border border-rim">
                  {players
                    .filter(p => selected.has(p.id))
                    .map(player => (
                      <div key={player.id} className="flex items-center gap-3 bg-surface-4 px-3 py-2.5">
                        <span className="min-w-0 flex-1 truncate text-sm text-ink">{player.name}</span>
                        <input
                          type="number"
                          inputMode="numeric"
                          placeholder="Puntos"
                          value={scores[player.id] ?? ''}
                          onChange={e =>
                            setScores(prev => ({ ...prev, [player.id]: e.target.value }))
                          }
                          className="w-20 rounded-lg border border-rim bg-surface-3 px-2 py-1.5 text-sm text-ink focus:border-rim-2 focus:outline-none"
                        />
                        <label className="flex items-center gap-1.5 text-xs text-ink-dim">
                          <input
                            type="radio"
                            name="winner"
                            checked={winnerId === player.id}
                            onChange={() => setWinnerId(player.id)}
                            className="accent-uno-yellow"
                          />
                          Ganó
                        </label>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <label className="flex flex-col gap-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-ink-dim">
                Notas (opcional)
              </span>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                maxLength={200}
                className="resize-none rounded-xl border border-rim bg-surface-4 px-3 py-2 text-sm text-ink placeholder:text-ink-dim focus:border-rim-2 focus:outline-none"
              />
            </label>

            {formError && (
              <p className="rounded-xl border border-uno-red/40 bg-uno-red/10 px-3 py-2 text-sm text-uno-red-bright">
                {formError}
              </p>
            )}
          </div>

          <div className="border-t border-rim px-5 py-4">
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-uno-green py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
            >
              {submitting ? 'Guardando…' : 'Guardar partida'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  )
}
