import { useSelector } from 'react-redux'
import { fetchBanks, setList, clearList } from './bank-slice'
import type { RootState } from '@/stores/store'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import type { Bank } from '@/types/bank.type'

export function useBankStore() {
  const dispatch = useAppDispatch()
  const list = useSelector((state: RootState) => state.bank?.list)
  const loading = useSelector((state: RootState) => state.bank?.loading)
  const error = useSelector((state: RootState) => state.bank?.error)

  return {
    list,
    loading,
    error,
    fetchBanks: () => dispatch(fetchBanks()),
    setList: (items: Bank[]) => dispatch(setList(items)),
    clearList: () => dispatch(clearList()),
  }
}
