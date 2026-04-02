import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { SystemConfig } from '@/types/system.type'
import { systemRequest } from './system-request'

interface SystemState {
  data: SystemConfig | null
  loading: boolean
  error?: string | null
}

const initialState: SystemState = {
  data: null,
  loading: false,
  error: null,
}

export const fetchSystem = createAsyncThunk(
  'system/fetchSystem',
  async (_, { rejectWithValue }) => {
    try {
      const res = await systemRequest.getSystem()
      return res.data
    } catch (error) {
      return rejectWithValue('Fetch system failed')
    }
  }
)

export const updateSystem = createAsyncThunk(
  'system/updateSystem',
  async (data: Partial<Omit<SystemConfig, 'id' | 'updatedAt'>>, { rejectWithValue }) => {
    try {
      const res = await systemRequest.updateSystem(data)
      return res.data
    } catch (error) {
      return rejectWithValue('Update system failed')
    }
  }
)

const systemSlice = createSlice({
  name: 'system',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<SystemConfig>) => {
      state.data = action.payload
    },
    clearData: (state) => {
      state.data = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSystem.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchSystem.fulfilled, (state, action: PayloadAction<SystemConfig>) => {
        state.loading = false
        state.data = action.payload
      })
      .addCase(fetchSystem.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Fetch system failed'
      })
      .addCase(updateSystem.fulfilled, (state, action: PayloadAction<SystemConfig>) => {
        state.data = action.payload
      })
  },
})

export const { setData, clearData } = systemSlice.actions
export default systemSlice.reducer
