import { useSelector, useDispatch } from 'react-redux'
import { fetchMe, login, register, logout, setUser } from './auth-slice'
import type { RootState, AppDispatch } from '@/stores/store'

export function useAuthStore() {
  const dispatch = useDispatch<AppDispatch>()
  const user = useSelector((state: RootState) => state.auth.user)

  return {
    user,
    setUser: (u: any) => dispatch(setUser(u)),
    fetchMe: () => dispatch(fetchMe()),
    login: (email: string, password: string) => dispatch(login({ email, password })),
    register: (data: { name: string; email: string; password: string }) => dispatch(register(data)),
    logout: () => dispatch(logout()),
  }
}