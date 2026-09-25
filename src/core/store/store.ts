import { configureStore } from '@reduxjs/toolkit'
import { jugadoresReducer } from '@/modules/jugadores'
import { partidasReducer } from '@/modules/partidas'
import { leaderboardReducer } from '@/modules/leaderboard'

export const store = configureStore({
  reducer: {
    jugadores: jugadoresReducer,
    partidas: partidasReducer,
    leaderboard: leaderboardReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
