import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Since we use localStorage + Bearer tokens (not cookies), we cannot check auth in Edge middleware.
// Auth protection is handled client-side by AuthProvider.
// Middleware only handles the logout route cleanup.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === '/logout') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/logout'],
};

