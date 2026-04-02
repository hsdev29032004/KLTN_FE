import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { Bank } from '@/types/bank.type'
import { bankRequest } from './bank-request'

interface BankState {
  list: Bank[]
  loading: boolean
  error?: string | null
}

const initialState: BankState = {
  list: [],
  loading: false,
  error: null,
}

export const fetchBanks = createAsyncThunk(
  'bank/fetchBanks',
  async (_, { rejectWithValue }) => {
    try {
      const res = await bankRequest.getBanks()
      return res.data as Bank[]
    } catch (error) {
      return rejectWithValue('Fetch banks failed')
    }
  }
)

export const createBank = createAsyncThunk(
  'bank/createBank',
  async (data: Omit<Bank, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const res = await bankRequest.createBank(data)
      return res.data
    } catch (error) {
      return rejectWithValue('Create bank failed')
    }
  }
)

export const updateBank = createAsyncThunk(
  'bank/updateBank',
  async ({ id, data }: { id: string; data: Partial<Omit<Bank, 'id' | 'createdAt' | 'updatedAt'>> }, { rejectWithValue }) => {
    try {
      const res = await bankRequest.updateBank(id, data)
      return res.data
    } catch (error) {
      return rejectWithValue('Update bank failed')
    }
  }
)

export const deleteBank = createAsyncThunk(
  'bank/deleteBank',
  async (id: string, { rejectWithValue }) => {
    try {
      await bankRequest.deleteBank(id)
      return id
    } catch (error) {
      return rejectWithValue('Delete bank failed')
    }
  }
)

const bankSlice = createSlice({
  name: 'bank',
  initialState,
  reducers: {
    setList: (state, action: PayloadAction<Bank[]>) => {
      state.list = action.payload
    },
    clearList: (state) => {
      state.list = []
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchBanks.fulfilled, (state, action: PayloadAction<Bank[]>) => {
        state.loading = false
        state.list = action.payload
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Fetch banks failed'
      })
      .addCase(createBank.fulfilled, (state, action: PayloadAction<Bank>) => {
        state.list.push(action.payload)
      })
      .addCase(updateBank.fulfilled, (state, action: PayloadAction<Bank>) => {
        const idx = state.list.findIndex((b) => b.id === action.payload.id)
        if (idx !== -1) state.list[idx] = action.payload
      })
      .addCase(deleteBank.fulfilled, (state, action: PayloadAction<string>) => {
        state.list = state.list.filter((b) => b.id !== action.payload)
      })
  },
})

export const { setList, clearList } = bankSlice.actions
export default bankSlice.reducer
