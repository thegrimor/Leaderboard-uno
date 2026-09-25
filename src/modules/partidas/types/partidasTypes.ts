export interface MatchPlayerEntry {
  playerId: string
  playerName: string
  score: number | null
  cardsEaten: number | null
  isWinner: boolean
}

export interface Match {
  id: string
  playedAt: string
  notes: string | null
  createdAt: string
  players: MatchPlayerEntry[]
}

export interface NewMatchPlayerInput {
  playerId: string
  score: number | null
  cardsEaten: number | null
  isWinner: boolean
}

export interface NewMatchInput {
  playedAt?: string
  notes?: string
  players: NewMatchPlayerInput[]
}

export interface PartidasState {
  items: Match[]
  status: 'idle' | 'loading' | 'succeeded' | 'error'
  error: string | null
}
