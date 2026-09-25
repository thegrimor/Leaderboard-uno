import { apiFetch } from '@/core/api/client'
import type { Match, NewMatchInput } from '../types/partidasTypes'

export const partidasApi = {
  list: () => apiFetch<{ matches: Match[] }>('/matches'),

  create: (input: NewMatchInput) =>
    apiFetch<{ match: Match }>('/matches', { method: 'POST', body: input }),

  remove: (id: string) => apiFetch<void>(`/matches/${id}`, { method: 'DELETE' }),
}
