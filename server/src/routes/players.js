import { randomUUID } from 'node:crypto'
import { Router } from 'express'
import { store } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

export const playersRouter = Router()

function normalizeName(name) {
  return typeof name === 'string' ? name.trim() : ''
}

playersRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const players = await store.listPlayers()
    res.json({ players })
  }),
)

playersRouter.post(
  '/',
  asyncHandler(async (req, res) => {
    const name = normalizeName(req.body?.name)
    if (!name) {
      return res.status(400).json({ error: 'El nombre del jugador es obligatorio.' })
    }
    if (await store.findPlayerByName(name)) {
      return res.status(409).json({ error: 'Ya existe un jugador con ese nombre.' })
    }
    const player = await store.createPlayer({
      id: randomUUID(),
      name,
      createdAt: new Date().toISOString(),
    })
    res.status(201).json({ player })
  }),
)

playersRouter.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const name = normalizeName(req.body?.name)
    if (!name) {
      return res.status(400).json({ error: 'El nombre del jugador es obligatorio.' })
    }
    const existing = await store.findPlayerById(req.params.id)
    if (!existing) {
      return res.status(404).json({ error: 'Jugador no encontrado.' })
    }
    const duplicate = await store.findPlayerByName(name)
    if (duplicate && duplicate.id !== existing.id) {
      return res.status(409).json({ error: 'Ya existe un jugador con ese nombre.' })
    }
    const player = await store.renamePlayer(req.params.id, name)
    res.json({ player })
  }),
)

playersRouter.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    await store.deletePlayer(req.params.id)
    res.status(204).end()
  }),
)
