import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Paths that require authentication
const protectedPaths = ['/dashboard', '/profile', '/settings']

// Paths that should redirect to dashboard if user is already authenticated
const authPaths = ['/login', '/register']

export function middleware(request: NextRequest) {
  const authStorage = request.cookies.get('auth-storage')
  const isAuthenticated = authStorage ? JSON.parse(decodeURIComponent(authStorage.value))?.state?.isAuthenticated : false

  const path = request.nextUrl.pathname

  // Check if the path is protected and user is not authenticated
  if (protectedPaths.some(p => path.startsWith(p)) && !isAuthenticated) {
    const url = new URL('/login', request.url)
    url.searchParams.set('from', path)
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from auth pages
  if (authPaths.some(p => path.startsWith(p)) && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (/api/*)
     * - static files (/_next/*)
     * - public files (/public/*)
     * - favicon.ico
     */
    '/((?!api|_next|public|favicon.ico).*)',
  ],
}
