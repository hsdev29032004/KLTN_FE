import { useSelector } from 'react-redux'
import { fetchMe, login, register, logout, setUser, refreshToken } from './auth-slice'
import type { RootState } from '@/stores/store'
import { useAppDispatch } from '@/hooks/use-app-dispatch'
import { UserLoginResponse } from '@/types/user.type'

export function useAuthStore() {
  const dispatch = useAppDispatch()
  const user = useSelector((state: RootState) => state.auth.user)

  return {
    user,
    setUser: (u: any) => dispatch(setUser(u)),
    fetchMe: () => dispatch(fetchMe()),
    login: (email: string, password: string): Promise<UserLoginResponse> => dispatch(login({ email, password })),
    register: (data: { name: string; email: string; password: string }) => dispatch(register(data)),
    logout: () => dispatch(logout()),
    refreshToken: () => dispatch(refreshToken()),
  }
}