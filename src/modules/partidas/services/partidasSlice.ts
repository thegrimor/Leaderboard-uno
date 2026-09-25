import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ApiError } from '@/core/api/client'
import { partidasApi } from './partidasApi'
import type { Match, NewMatchInput, PartidasState } from '../types/partidasTypes'

const initialState: PartidasState = {
  items: [],
  status: 'idle',
  error: null,
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'No se pudo completar la operación.'
}

function sortByPlayedAtDesc(items: Match[]) {
  items.sort((a, b) => b.playedAt.localeCompare(a.playedAt))
}

export const fetchMatches = createAsyncThunk('partidas/fetch', async () => {
  const { matches } = await partidasApi.list()
  return matches
})

export const addMatch = createAsyncThunk<Match, NewMatchInput, { rejectValue: string }>(
  'partidas/add',
  async (input, { rejectWithValue }) => {
    try {
      const { match } = await partidasApi.create(input)
      return match
    } catch (err) {
      return rejectWithValue(errorMessage(err))
    }
  },
)

export const removeMatch = createAsyncThunk<string, string, { rejectValue: string }>(
  'partidas/remove',
  async (id, { rejectWithValue }) => {
    try {
      await partidasApi.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(errorMessage(err))
    }
  },
)

const partidasSlice = createSlice({
  name: 'partidas',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchMatches.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchMatches.rejected, state => {
        state.status = 'error'
        state.error = 'No se pudo cargar el historial de partidas.'
      })
      .addCase(addMatch.fulfilled, (state, action) => {
        state.items.push(action.payload)
        sortByPlayedAtDesc(state.items)
      })
      .addCase(addMatch.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo registrar la partida.'
      })
      .addCase(removeMatch.fulfilled, (state, action) => {
        state.items = state.items.filter(m => m.id !== action.payload)
      })
      .addCase(removeMatch.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo eliminar la partida.'
      })
  },
})

export const { clearError } = partidasSlice.actions
export default partidasSlice.reducer
