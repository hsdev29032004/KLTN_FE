import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { invoiceRequest } from './invoice-request';
import type {
  InvoiceDetail,
  InvoiceDetailMeta,
  InvoiceDetailParams,
  MyInvoice,
  MyInvoiceListParams,
} from '@/types/invoice.type';

interface InvoiceState {
  list: InvoiceDetail[];
  meta: InvoiceDetailMeta | null;
  loading: boolean;
  error: string | null;
  // user invoices
  myInvoices: MyInvoice[];
  myInvoicesMeta: InvoiceDetailMeta | null;
  myInvoicesLoading: boolean;
  selectedInvoice: MyInvoice | null;
  selectedInvoiceLoading: boolean;
}

const initialState: InvoiceState = {
  list: [],
  meta: null,
  loading: false,
  error: null,
  myInvoices: [],
  myInvoicesMeta: null,
  myInvoicesLoading: false,
  selectedInvoice: null,
  selectedInvoiceLoading: false,
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

export const fetchMyInvoices = createAsyncThunk(
  'invoice/fetchMyInvoices',
  async (params: MyInvoiceListParams | undefined, { rejectWithValue }) => {
    try {
      const response = await invoiceRequest.getMyInvoices(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi tải danh sách hóa đơn');
    }
  }
);

export const fetchMyInvoiceDetail = createAsyncThunk(
  'invoice/fetchMyInvoiceDetail',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await invoiceRequest.getMyInvoiceDetail(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error?.response?.data?.message || 'Lỗi khi tải chi tiết hóa đơn');
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
    clearSelectedInvoice: (state) => {
      state.selectedInvoice = null;
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
      })
      .addCase(fetchMyInvoices.pending, (state) => {
        state.myInvoicesLoading = true;
      })
      .addCase(fetchMyInvoices.fulfilled, (state, action) => {
        state.myInvoicesLoading = false;
        state.myInvoices = action.payload.data;
        state.myInvoicesMeta = action.payload.meta;
      })
      .addCase(fetchMyInvoices.rejected, (state, action) => {
        state.myInvoicesLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMyInvoiceDetail.pending, (state) => {
        state.selectedInvoiceLoading = true;
      })
      .addCase(fetchMyInvoiceDetail.fulfilled, (state, action) => {
        state.selectedInvoiceLoading = false;
        state.selectedInvoice = action.payload;
      })
      .addCase(fetchMyInvoiceDetail.rejected, (state, action) => {
        state.selectedInvoiceLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearInvoices, clearSelectedInvoice } = invoiceSlice.actions;
export default invoiceSlice.reducer;
