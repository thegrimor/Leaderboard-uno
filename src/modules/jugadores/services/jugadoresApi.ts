import { apiFetch } from '@/core/api/client'
import type { Player } from '../types/jugadoresTypes'

export const jugadoresApi = {
  list: () => apiFetch<{ players: Player[] }>('/players'),

  create: (name: string) =>
    apiFetch<{ player: Player }>('/players', { method: 'POST', body: { name } }),

  rename: (id: string, name: string) =>
    apiFetch<{ player: Player }>(`/players/${id}`, { method: 'PATCH', body: { name } }),

  remove: (id: string) => apiFetch<void>(`/players/${id}`, { method: 'DELETE' }),
}
