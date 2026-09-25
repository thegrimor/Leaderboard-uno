export interface LeaderboardEntry {
  playerId: string
  playerName: string
  matchesPlayed: number
  wins: number
  totalCardsEaten: number
  winRate: number
}

export interface CardsRecord {
  playerId: string
  playerName: string
  cardsEaten: number
  matchId: string
  playedAt: string
}

export interface LeaderboardState {
  items: LeaderboardEntry[]
  cardsRecord: CardsRecord | null
  status: 'idle' | 'loading' | 'succeeded' | 'error'
  error: string | null
}
