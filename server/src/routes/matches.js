import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { store } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

export const matchesRouter = Router()

function validateMatchPlayers(players) {
  if (!Array.isArray(players) || players.length < 2) {
    return 'Una partida necesita al menos 2 jugadores.'
  }
  const seen = new Set()
  let winners = 0
  for (const entry of players) {
    if (!entry || typeof entry.playerId !== 'string' || !entry.playerId) {
      return 'Cada jugador de la partida necesita un playerId válido.'
    }
    if (seen.has(entry.playerId)) {
      return 'Un jugador no puede repetirse en la misma partida.'
    }
    seen.add(entry.playerId)
    if (entry.score != null && (typeof entry.score !== 'number' || !Number.isFinite(entry.score))) {
      return 'El puntaje debe ser un número.'
    }
    if (
      entry.cardsEaten != null &&
      (typeof entry.cardsEaten !== 'number' || !Number.isFinite(entry.cardsEaten) || entry.cardsEaten < 0)
    ) {
      return 'Las cartas comidas deben ser un número igual o mayor que 0.'
    }
    if (entry.isWinner) winners += 1
  }
  if (winners !== 1) {
    return 'La partida debe tener exactamente un ganador.'
  }
  return null
}

matchesRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const matches = await store.listMatches()
    res.json({ matches })
  }),
)

matchesRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const { playedAt, notes, players } = req.body ?? {}
    const validationError = validateMatchPlayers(players)
    if (validationError) {
      return res.status(400).json({ error: validationError })
    }
    for (const entry of players) {
      if (!(await store.findPlayerById(entry.playerId))) {
        return res.status(400).json({ error: `Jugador ${entry.playerId} no existe.` })
      }
    }
    const match = await store.createMatch({
      id: randomUUID(),
      playedAt: playedAt || new Date().toISOString(),
      notes: typeof notes === 'string' && notes.trim() ? notes.trim() : null,
      createdAt: new Date().toISOString(),
      players: players.map(p => ({
        playerId: p.playerId,
        score: p.score ?? null,
        cardsEaten: p.cardsEaten ?? null,
        isWinner: !!p.isWinner,
      })),
    })
    res.status(201).json({ match })
  }),
)

matchesRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await store.deleteMatch(req.params.id)
    res.status(204).end()
  }),
)
