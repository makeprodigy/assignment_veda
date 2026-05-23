import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PROTECTED = ['/dashboard', '/assignments', '/groups', '/toolkit', '/library', '/settings'];
const AUTH_ROUTES = ['/login', '/register'];

// Simple JWT parser that works perfectly in Vercel Edge without pulling in crypto libraries
function parseJwt(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Handle Next.js side logout
  if (pathname === '/logout') {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('vedaai_token');
    return response;
  }

  const token = request.cookies.get('vedaai_token')?.value;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  const isAuthRoute = AUTH_ROUTES.some((r) => pathname.startsWith(r));

  if (!isProtected && !isAuthRoute) {
    return NextResponse.next();
  }

  let isValid = false;

  if (token) {
    const payload = parseJwt(token);
    // Check if token exists and isn't expired
    if (payload && payload.exp && payload.exp * 1000 > Date.now()) {
      isValid = true;
    }
  }

  if (isProtected && !isValid) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && isValid) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/assignments/:path*', '/groups/:path*', '/toolkit/:path*', '/library/:path*', '/settings/:path*', '/login', '/register', '/logout'],
};
