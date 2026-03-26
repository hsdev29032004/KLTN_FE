import { useSelector } from 'react-redux'
import type { RootState } from '@/stores/store'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { setEncryptUrl } from './app-slice'

export function useAppStore() {
  const dispatch = useAppDispatch()
  const encryptUrl = useSelector((state: RootState) => state.app.encryptUrl)

  return {
    encryptUrl,
    setEncryptUrl: (encryptUrl: string) => dispatch(setEncryptUrl(encryptUrl)),
  }
}