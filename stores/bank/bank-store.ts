import { useSelector } from 'react-redux'
import { fetchBanks, createBank, updateBank, deleteBank, setList, clearList } from './bank-slice'
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
    createBank: (data: Omit<Bank, 'id' | 'createdAt' | 'updatedAt'>) => dispatch(createBank(data)),
    updateBank: (id: string, data: Partial<Omit<Bank, 'id' | 'createdAt' | 'updatedAt'>>) => dispatch(updateBank({ id, data })),
    deleteBank: (id: string) => dispatch(deleteBank(id)),
    setList: (items: Bank[]) => dispatch(setList(items)),
    clearList: () => dispatch(clearList()),
  }
}
