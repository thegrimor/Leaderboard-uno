export interface Player {
  id: string
  name: string
  createdAt: string
}

export interface JugadoresState {
  items: Player[]
  status: 'idle' | 'loading' | 'succeeded' | 'error'
  error: string | null
}
