"use client"

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import Cookies from 'js-cookie'
import { useEffect, ReactNode, useState, ComponentProps } from "react"

export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      {...props}
    >
      <ThemeSync>{children}</ThemeSync>
    </NextThemesProvider>
  );
}

function ThemeSync({ children }: { children: ReactNode }) {
  const { theme, setTheme } = useNextTheme()
  const [hydrated, setHydrated] = useState(false)
  
  useEffect(() => {
    const cookieTheme = Cookies.get('theme')
    if (cookieTheme && cookieTheme !== theme) {
      setTheme(cookieTheme)
    }
    setHydrated(true)
  }, [])
  
  useEffect(() => {
    if (hydrated && theme) {
      Cookies.set('theme', theme, { 
        expires: 365,
        path: '/',
        sameSite: 'lax'
      })
    }
  }, [theme, hydrated])
  
  return <>{children}</>
}
