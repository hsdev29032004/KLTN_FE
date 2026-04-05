import { useSelector } from 'react-redux'
import { createPaymentUrl, fetchTransactions, clearError } from './payment-slice'
import type { RootState } from '@/stores/store'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { GetTransactionsParams } from '@/types/transaction.type'

export function usePaymentStore() {
  const dispatch = useAppDispatch()
  const loading = useSelector((state: RootState) => state.payment?.loading)
  const transactionsLoading = useSelector((state: RootState) => state.payment?.transactionsLoading)
  const error = useSelector((state: RootState) => state.payment?.error)
  const transactions = useSelector((state: RootState) => state.payment?.transactions)
  const total = useSelector((state: RootState) => state.payment?.total)
  const page = useSelector((state: RootState) => state.payment?.page)
  const limit = useSelector((state: RootState) => state.payment?.limit)
  const totalPages = useSelector((state: RootState) => state.payment?.totalPages)

  return {
    loading,
    transactionsLoading,
    error,
    transactions,
    total,
    page,
    limit,
    totalPages,
    createPaymentUrl: (amount: number) => dispatch(createPaymentUrl(amount)),
    fetchTransactions: (params?: GetTransactionsParams | undefined) => dispatch(fetchTransactions(params)),
    clearError: () => dispatch(clearError()),
  }
}
