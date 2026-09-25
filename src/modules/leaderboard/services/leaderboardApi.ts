import { apiFetch } from '@/core/api/client'
import type { CardsRecord, LeaderboardEntry } from '../types/leaderboardTypes'

export const leaderboardApi = {
  get: () =>
    apiFetch<{ leaderboard: LeaderboardEntry[]; cardsRecord: CardsRecord | null }>('/leaderboard'),
}
