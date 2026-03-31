import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { statRequest } from './stat-request';

interface StatState {
  revenueByMonth: any | null;
  loading: boolean;
  error?: string | null;
}

const initialState: StatState = {
  revenueByMonth: null,
  loading: false,
  error: null,
};

export const fetchRevenueByMonth = createAsyncThunk(
  'stat/fetchRevenueByMonth',
  async (_, { rejectWithValue }) => {
    try {
      const res = await statRequest.fetchRevenueByMonth();
      return res.data;
    } catch (error) {
      return rejectWithValue('Fetch revenue failed');
    }
  },
);

const statSlice = createSlice({
  name: 'stat',
  initialState,
  reducers: {
    clearStat: (state) => {
      state.revenueByMonth = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueByMonth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchRevenueByMonth.fulfilled,
        (state, action: PayloadAction<any>) => {
          state.loading = false;
          state.revenueByMonth = action.payload;
        },
      )
      .addCase(fetchRevenueByMonth.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || 'Fetch revenue failed';
      });
  },
});

export const { clearStat } = statSlice.actions;
export default statSlice.reducer;
