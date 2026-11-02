import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_COOKIE_NAME = 'shefeer_admin_session';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = (request.headers.get('host') || '').toLowerCase();
  const isLocal = host.includes('localhost') || host.includes('127.0.0.1');

  // Domain routing: Primary showcase (shefeer.runs-on.dev) and Admin host (shefeer.vercel.app)
  if (!isLocal) {
    const isAssetOrInternal =
      pathname.startsWith('/_next') ||
      pathname.startsWith('/assets') ||
      pathname === '/icon.svg' ||
      pathname === '/robots.txt';

    if (!isAssetOrInternal) {
      // Rule A: Anyone accessing /admin on runs-on.dev is routed to the dedicated admin host on vercel.app
      if (host.includes('runs-on.dev') && pathname.startsWith('/admin')) {
        const adminUrl = new URL(`https://shefeer.vercel.app${pathname}${search}`);
        return NextResponse.redirect(adminUrl, 307);
      }

      // Rule B: Anyone accessing public pages on vercel.app is redirected to the primary domain on runs-on.dev
      if (
        host.includes('vercel.app') &&
        !pathname.startsWith('/admin') &&
        !pathname.startsWith('/api/admin')
      ) {
        const primaryUrl = new URL(`https://shefeer.runs-on.dev${pathname}${search}`);
        return NextResponse.redirect(primaryUrl, 308);
      }
    }
  }

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
    /*
     * Match all request paths except static files and icons:
     */
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt).*)',
  ],
};
