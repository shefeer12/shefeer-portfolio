import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminPassword
} from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);

    // Rate limit: Max 5 failed attempts per 15 minutes per IP
    const rateLimit = checkRateLimit(`login:${ip}`, 5, 15 * 60);
    if (!rateLimit.success) {
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${rateLimit.retryAfterSeconds} seconds.`
        },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Password is required.' },
        { status: 400 }
      );
    }

    const isValid = verifyAdminPassword(password.trim());

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials.' },
        { status: 401 }
      );
    }

    // Generate secure session token (valid for 7 days)
    const token = createSessionToken('shefeer', 7 * 24 * 3600);
    const cookieOptions = getSessionCookieOptions(7 * 24 * 3600);

    const response = NextResponse.json({
      success: true,
      message: 'Authentication successful.'
    });

    response.headers.set('Set-Cookie', `${ADMIN_COOKIE_NAME}=${token}; ${cookieOptions}`);
    return response;
  } catch (err) {
    console.error('Admin login error:', err);
    return NextResponse.json(
      { error: 'An unexpected authentication error occurred.' },
      { status: 500 }
    );
  }
}
