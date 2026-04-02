
import { useSelector } from 'react-redux'
import { fetchSystem, updateSystem, setData, clearData } from './system-slice'
import type { RootState } from '@/stores/store'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import type { SystemConfig } from '@/types/system.type'

export function useSystemStore() {
  const dispatch = useAppDispatch()
  const data = useSelector((state: RootState) => state.system?.data)
  const loading = useSelector((state: RootState) => state.system?.loading)
  const error = useSelector((state: RootState) => state.system?.error)

  return {
    data,
    loading,
    error,
    fetchSystem: () => dispatch(fetchSystem()),
    updateSystem: (payload: Partial<Omit<SystemConfig, 'id' | 'updatedAt'>>) => dispatch(updateSystem(payload)),
    setData: (item: SystemConfig) => dispatch(setData(item)),
    clearData: () => dispatch(clearData()),
  }
}
