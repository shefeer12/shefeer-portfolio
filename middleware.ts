import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'shefeer_admin_session';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Fast-path check: block unauthenticated /api/admin/* requests (except login) at the edge
  if (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth/login') {
    const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value;
    if (!sessionCookie || sessionCookie.trim() === '') {
      const unauthorizedResponse = NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      );
      unauthorizedResponse.headers.set('X-Content-Type-Options', 'nosniff');
      unauthorizedResponse.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
      unauthorizedResponse.headers.set('X-Frame-Options', 'DENY');
      unauthorizedResponse.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      return unauthorizedResponse;
    }
  }

  const response = NextResponse.next();

  // 2. Global security headers (safe for Cloudinary & Vimeo video streaming)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // 3. Dedicated Admin UI & API protections (anti-indexing, anti-framing / clickjacking)
  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('Content-Security-Policy', "frame-ancestors 'none';");
  }

  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*'
  ]
};
