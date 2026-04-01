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
  },
})

export const { setList, clearList } = bankSlice.actions
export default bankSlice.reducer
