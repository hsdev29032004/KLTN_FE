"use client"

import { useRef } from 'react'
import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/stores/store'
import { setUser } from '@/stores/auth/auth-slice'

export default function ReduxProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser?: any
}) {
  const storeRef = useRef<AppStore | undefined>(undefined)
  
  if (!storeRef.current) {
    storeRef.current = makeStore()
    if (initialUser) {
      storeRef.current.dispatch(setUser(initialUser))
    }
  }

  return <Provider store={storeRef.current!}>{children}</Provider>
}
