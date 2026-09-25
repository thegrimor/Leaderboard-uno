import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { ApiError } from '@/core/api/client'
import { jugadoresApi } from './jugadoresApi'
import type { JugadoresState, Player } from '../types/jugadoresTypes'

const initialState: JugadoresState = {
  items: [],
  status: 'idle',
  error: null,
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError ? err.message : 'No se pudo completar la operación.'
}

export const fetchPlayers = createAsyncThunk('jugadores/fetch', async () => {
  const { players } = await jugadoresApi.list()
  return players
})

export const addPlayer = createAsyncThunk<Player, string, { rejectValue: string }>(
  'jugadores/add',
  async (name, { rejectWithValue }) => {
    try {
      const { player } = await jugadoresApi.create(name)
      return player
    } catch (err) {
      return rejectWithValue(errorMessage(err))
    }
  },
)

export const renamePlayer = createAsyncThunk<
  Player,
  { id: string; name: string },
  { rejectValue: string }
>('jugadores/rename', async ({ id, name }, { rejectWithValue }) => {
  try {
    const { player } = await jugadoresApi.rename(id, name)
    return player
  } catch (err) {
    return rejectWithValue(errorMessage(err))
  }
})

export const removePlayer = createAsyncThunk<string, string, { rejectValue: string }>(
  'jugadores/remove',
  async (id, { rejectWithValue }) => {
    try {
      await jugadoresApi.remove(id)
      return id
    } catch (err) {
      return rejectWithValue(errorMessage(err))
    }
  },
)

const jugadoresSlice = createSlice({
  name: 'jugadores',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null
    },
  },
  extraReducers: builder => {
    builder
      .addCase(fetchPlayers.pending, state => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchPlayers.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchPlayers.rejected, state => {
        state.status = 'error'
        state.error = 'No se pudo cargar la lista de jugadores.'
      })
      .addCase(addPlayer.fulfilled, (state, action) => {
        state.items.push(action.payload)
        state.items.sort((a, b) => a.name.localeCompare(b.name))
      })
      .addCase(addPlayer.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo crear el jugador.'
      })
      .addCase(renamePlayer.fulfilled, (state, action) => {
        const idx = state.items.findIndex(p => p.id === action.payload.id)
        if (idx !== -1) state.items[idx] = action.payload
        state.items.sort((a, b) => a.name.localeCompare(b.name))
      })
      .addCase(renamePlayer.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo renombrar el jugador.'
      })
      .addCase(removePlayer.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload)
      })
      .addCase(removePlayer.rejected, (state, action) => {
        state.error = action.payload ?? 'No se pudo eliminar el jugador.'
      })
  },
})

export const { clearError } = jugadoresSlice.actions
export default jugadoresSlice.reducer
