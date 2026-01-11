// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { themeMiddleware } from './middlewares/01.theme.middleware'
import { redirectMiddleware } from './middlewares/02.redirect.middleware'
import { authMiddleware } from './middlewares/03.auth.middleware'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next()

  const middlewares = [
    themeMiddleware,
    redirectMiddleware,
    authMiddleware,
    // ...(req.nextUrl.pathname.startsWith('/(client)') ? [testMiddleware] : []),
  ]

  for (const mw of middlewares) {
    const result = await mw(req, res)

    if (result instanceof Response) {
      return result
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|public|favicon.ico|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg|.*\\.webp|.*\\.ico|.*\\.css|.*\\.js).*)',
  ],
}
