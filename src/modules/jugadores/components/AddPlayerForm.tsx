import { useState } from 'react'
import { useAppDispatch } from '@/core/store/hooks'
import { addPlayer } from '../services/jugadoresSlice'

export function AddPlayerForm() {
  const dispatch = useAppDispatch()
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed || submitting) return
    setSubmitting(true)
    const result = await dispatch(addPlayer(trimmed))
    setSubmitting(false)
    if (addPlayer.fulfilled.match(result)) {
      setName('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="Nombre del jugador"
        maxLength={40}
        className="min-w-0 flex-1 rounded-xl border border-rim bg-surface-3 px-4 py-3 text-sm text-ink placeholder:text-ink-dim focus:border-rim-2 focus:outline-none"
      />
      <button
        type="submit"
        disabled={!name.trim() || submitting}
        className="rounded-xl bg-uno-blue px-5 py-3 text-sm font-semibold text-white transition-colors disabled:opacity-40"
      >
        Añadir
      </button>
    </form>
  )
}
