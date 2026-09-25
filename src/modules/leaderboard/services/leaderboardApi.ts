import { apiFetch } from '@/core/api/client'
import type { LeaderboardEntry } from '../types/leaderboardTypes'

export const leaderboardApi = {
  get: () => apiFetch<{ leaderboard: LeaderboardEntry[] }>('/leaderboard'),
}
