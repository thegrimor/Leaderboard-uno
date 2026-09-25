export interface LeaderboardEntry {
  playerId: string
  playerName: string
  matchesPlayed: number
  wins: number
  winRate: number
  totalScore: number
  avgScore: number | null
}

export interface LeaderboardState {
  items: LeaderboardEntry[]
  status: 'idle' | 'loading' | 'succeeded' | 'error'
  error: string | null
}
