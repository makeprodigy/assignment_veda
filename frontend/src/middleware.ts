import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const PROTECTED = ['/dashboard', '/assignments', '/groups', '/toolkit', '/library', '/settings'];
const AUTH_ROUTES = ['/login', '/register'];

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
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'vedaai_super_secret_jwt_key_2024');
      await jwtVerify(token, secret);
      isValid = true;
    } catch (e) {
      isValid = false;
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
