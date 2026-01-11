import { AppMiddleware } from '@/types/middleware.type'
import { NextRequest, NextResponse } from 'next/server'

export const themeMiddleware: AppMiddleware = (
  req: NextRequest,
  res: NextResponse
) => {
  const theme = req.cookies.get('theme')?.value || 'dark'

  if (!req.cookies.has('theme')) {
    res.cookies.set('theme', theme, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }
}
