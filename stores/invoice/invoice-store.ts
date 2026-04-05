import { useSelector } from 'react-redux';
import {
  fetchInvoiceDetails,
  fetchMyInvoices,
  fetchMyInvoiceDetail,
  clearInvoices,
  clearSelectedInvoice,
} from './invoice-slice';
import type { RootState } from '@/stores/store';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import type { InvoiceDetailParams, MyInvoiceListParams } from '@/types/invoice.type';

export function useInvoiceStore() {
  const dispatch = useAppDispatch();
  const list = useSelector((state: RootState) => state.invoice?.list);
  const meta = useSelector((state: RootState) => state.invoice?.meta);
  const loading = useSelector((state: RootState) => state.invoice?.loading);
  const error = useSelector((state: RootState) => state.invoice?.error);
  const myInvoices = useSelector((state: RootState) => state.invoice?.myInvoices);
  const myInvoicesMeta = useSelector((state: RootState) => state.invoice?.myInvoicesMeta);
  const myInvoicesLoading = useSelector((state: RootState) => state.invoice?.myInvoicesLoading);
  const selectedInvoice = useSelector((state: RootState) => state.invoice?.selectedInvoice);
  const selectedInvoiceLoading = useSelector((state: RootState) => state.invoice?.selectedInvoiceLoading);

  return {
    list,
    meta,
    loading,
    error,
    myInvoices,
    myInvoicesMeta,
    myInvoicesLoading,
    selectedInvoice,
    selectedInvoiceLoading,
    fetchInvoiceDetails: (params?: InvoiceDetailParams) =>
      dispatch(fetchInvoiceDetails(params)),
    fetchMyInvoices: (params?: MyInvoiceListParams) =>
      dispatch(fetchMyInvoices(params)),
    fetchMyInvoiceDetail: (id: string) =>
      dispatch(fetchMyInvoiceDetail(id)),
    clearInvoices: () => dispatch(clearInvoices()),
    clearSelectedInvoice: () => dispatch(clearSelectedInvoice()),
  };
}
