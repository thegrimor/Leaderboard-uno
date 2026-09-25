import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { leaderboardApi } from './leaderboardApi'
import type { LeaderboardState } from '../types/leaderboardTypes'

const initialState: LeaderboardState = {
  items: [],
  cardsRecord: null,
  status: 'idle',
  error: null,
}

export const fetchLeaderboard = createAsyncThunk('leaderboard/fetch', async () => {
  return leaderboardApi.get()
})

const leaderboardSlice = createSlice({
  name: 'leaderboard',
  initialState,
  reducers: {},
  extraReducers: builder => {
    builder
      .addCase(fetchLeaderboard.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload.leaderboard
        state.cardsRecord = action.payload.cardsRecord
      })
      .addCase(fetchLeaderboard.rejected, state => {
        state.status = 'error'
        state.error = 'No se pudo cargar el ranking.'
      })
  },
})

export default leaderboardSlice.reducer
