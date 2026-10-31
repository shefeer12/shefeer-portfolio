import { NextResponse } from 'next/server';
import {
  ADMIN_COOKIE_NAME,
  createSessionToken,
  getSessionCookieOptions,
  verifyAdminPassword
} from '@/lib/auth';
import {
  getClientIp,
  isRateLimited,
  recordFailedAttempt,
  resetRateLimit
} from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request.headers);
    const failKey = `login-fail:${ip}`;

    // Rate limit: at most 5 failed attempts per IP per 15 minutes (900 seconds)
    // Serverless Note: In-memory store operates per lambda instance. In multi-instance or high cold-start
    // serverless deployments, an external state store (e.g. Upstash Redis) provides distributed enforcement.
    if (isRateLimited(failKey, 5)) {
      return NextResponse.json(
        { error: 'Incorrect password.' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { password } = body;

    if (!password || typeof password !== 'string') {
      recordFailedAttempt(failKey, 15 * 60, 5);
      return NextResponse.json(
        { error: 'Incorrect password.' },
        { status: 401 }
      );
    }

    const isValid = verifyAdminPassword(password.trim());

    if (!isValid) {
      recordFailedAttempt(failKey, 15 * 60, 5);
      return NextResponse.json(
        { error: 'Incorrect password.' },
        { status: 401 }
      );
    }

    // Reset failed counter upon successful login
    resetRateLimit(failKey);

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
      { error: 'Incorrect password.' },
      { status: 500 }
    );
  }
}
