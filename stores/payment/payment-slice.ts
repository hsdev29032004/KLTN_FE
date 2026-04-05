import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { paymentRequest, CreatePaymentUrlResponse } from './payment-request'
import { Transaction, GetTransactionsParams } from '@/types/transaction.type'

interface PaymentState {
  loading: boolean
  transactionsLoading: boolean
  error?: string | null
  transactions: Transaction[]
  total: number
  page: number
  limit: number
  totalPages: number
}

const initialState: PaymentState = {
  loading: false,
  transactionsLoading: false,
  error: null,
  transactions: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
}

export const createPaymentUrl = createAsyncThunk(
  'payment/createPaymentUrl',
  async (amount: number, { rejectWithValue }) => {
    try {
      const res = await paymentRequest.createPaymentUrl(amount)
      return res.data
    } catch (error) {
      return rejectWithValue('Tạo link thanh toán thất bại')
    }
  }
)

export const fetchTransactions = createAsyncThunk(
  'payment/fetchTransactions',
  async (params: GetTransactionsParams | undefined, { rejectWithValue }) => {
    try {
      const res = await paymentRequest.getTransactions(params)
      return {
        data: res.data,
        meta: res.meta,
      }
    } catch (error) {
      return rejectWithValue('Lấy lịch sử giao dịch thất bại')
    }
  }
)

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentUrl.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createPaymentUrl.fulfilled, (state) => {
        state.loading = false
      })
      .addCase(createPaymentUrl.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string || 'Tạo link thanh toán thất bại'
      })
      .addCase(fetchTransactions.pending, (state) => {
        state.transactionsLoading = true
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.transactionsLoading = false
        state.transactions = action.payload.data
        state.total = action.payload.meta.total
        state.page = action.payload.meta.page
        state.limit = action.payload.meta.limit
        state.totalPages = action.payload.meta.totalPages
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.transactionsLoading = false
        state.error = action.payload as string || 'Lấy lịch sử giao dịch thất bại'
      })
  },
})

export const { clearError } = paymentSlice.actions
export default paymentSlice.reducer
