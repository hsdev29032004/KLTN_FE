import { NextRequest, NextResponse } from 'next/server'

export type AppMiddleware = (
  req: NextRequest,
  res: NextResponse
) => Promise<Response | void> | Response | void
