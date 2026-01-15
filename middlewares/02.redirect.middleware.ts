import { NextRequest, NextResponse } from 'next/server';

export function redirectMiddleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;

  if (pathname === '/admin') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (pathname === '/lecturer') {
    return NextResponse.redirect(new URL('/lecturer/dashboard', request.url));
  }

  if (pathname === '/auth/signup') {
    return NextResponse.redirect(new URL('/signup', request.url));
  }
}
