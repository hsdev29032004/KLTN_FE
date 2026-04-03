import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { invoiceRequest } from './invoice-request';
import type { InvoiceDetail, InvoiceDetailMeta, InvoiceDetailParams } from '@/types/invoice.type';

interface InvoiceState {
  list: InvoiceDetail[];
  meta: InvoiceDetailMeta | null;
  loading: boolean;
  error: string | null;
}

const initialState: InvoiceState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
};

export const fetchInvoiceDetails = createAsyncThunk(
  'invoice/fetchInvoiceDetails',
  async (params: InvoiceDetailParams | undefined, { rejectWithValue }) => {
    try {
      const response = await invoiceRequest.getInvoiceDetails(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi tải danh sách giao dịch');
    }
  }
);

const invoiceSlice = createSlice({
  name: 'invoice',
  initialState,
  reducers: {
    clearInvoices: (state) => {
      state.list = [];
      state.meta = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoiceDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoiceDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(fetchInvoiceDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearInvoices } = invoiceSlice.actions;
export default invoiceSlice.reducer;
