import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // For now, let pages handle their own auth checks
  return NextResponse.next()
}

export const config = {
  matcher: ['/transactions/:path*', '/budgets/:path*', '/pots/:path*', '/recurring-bills/:path*', '/profile/:path*'],
}
