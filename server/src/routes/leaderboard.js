import { Router } from 'express'
import { store } from '../db.js'
import { asyncHandler } from '../asyncHandler.js'

export const leaderboardRouter = Router()

leaderboardRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const leaderboard = await store.leaderboard()
    res.json({ leaderboard })
  }),
)
