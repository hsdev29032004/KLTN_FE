import { useSelector } from 'react-redux';
import { fetchInvoiceDetails, clearInvoices } from './invoice-slice';
import type { RootState } from '@/stores/store';
import { useAppDispatch } from '@/hooks/use-app-dispatch';
import type { InvoiceDetailParams } from '@/types/invoice.type';

export function useInvoiceStore() {
  const dispatch = useAppDispatch();
  const list = useSelector((state: RootState) => state.invoice?.list);
  const meta = useSelector((state: RootState) => state.invoice?.meta);
  const loading = useSelector((state: RootState) => state.invoice?.loading);
  const error = useSelector((state: RootState) => state.invoice?.error);

  return {
    list,
    meta,
    loading,
    error,
    fetchInvoiceDetails: (params?: InvoiceDetailParams) =>
      dispatch(fetchInvoiceDetails(params)),
    clearInvoices: () => dispatch(clearInvoices()),
  };
}
