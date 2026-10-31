import crypto from 'crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const ADMIN_COOKIE_NAME = 'shefeer_admin_session';

/**
 * Returns the configured admin password.
 * In development, falls back to a default if not set in .env.local.
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== 'production' ? 'shefeer-edit-2026' : '');
}

/**
 * Returns the secret key for HMAC token signing.
 */
function getSessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= 16) {
    return secret;
  }
  // Safe deterministic fallback for development
  return 'shefeer-cinematic-portfolio-2026-secure-session-salt';
}

/**
 * Base64URL encoding helper.
 */
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

/**
 * Base64URL decoding helper.
 */
function base64UrlDecode(str: string): string {
  str = str.replace(/-/g, '+').replace(/_/g, '/');
  while (str.length % 4) {
    str += '=';
  }
  return Buffer.from(str, 'base64').toString('utf8');
}

export interface SessionPayload {
  u: string; // username
  iat: number; // issued at
  exp: number; // expires at
}

/**
 * Signs a session payload into a tamper-proof HMAC-SHA256 token.
 */
export function createSessionToken(username = 'shefeer', expiresInSeconds = 7 * 24 * 3600): string {
  const now = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    u: username,
    iat: now,
    exp: now + expiresInSeconds
  };

  const payloadString = JSON.stringify(payload);
  const encodedPayload = base64UrlEncode(payloadString);
  const signature = crypto
    .createHmac('sha256', getSessionSecret())
    .update(encodedPayload)
    .digest('base64url');

  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies an HMAC-SHA256 token and returns the payload if valid.
 */
export function verifySessionToken(token?: string | null): SessionPayload | null {
  if (!token || typeof token !== 'string') return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [encodedPayload, signature] = parts;

  try {
    const expectedSignature = crypto
      .createHmac('sha256', getSessionSecret())
      .update(encodedPayload)
      .digest('base64url');

    // Constant-time HMAC verification using fixed-length SHA-256 digests
    const sigSha = crypto.createHash('sha256').update(signature).digest();
    const expectedSha = crypto.createHash('sha256').update(expectedSignature).digest();

    if (!crypto.timingSafeEqual(sigSha, expectedSha)) {
      return null;
    }

    const payload: SessionPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) {
      return null; // Expired
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Verifies password against configured ADMIN_PASSWORD using constant-time comparison.
 * Hashes both values with SHA-256 to ensure identical fixed buffer lengths before comparison,
 * eliminating length-based timing leakages.
 */
export function verifyAdminPassword(input: string): boolean {
  const actual = getAdminPassword();
  if (!actual || !input) return false;

  const inputHash = crypto.createHash('sha256').update(input).digest();
  const actualHash = crypto.createHash('sha256').update(actual).digest();

  return crypto.timingSafeEqual(inputHash, actualHash);
}

/**
 * Extracts and verifies the session token from an incoming Next.js Request.
 */
export function getSessionFromRequest(request: Request): SessionPayload | null {
  const cookieHeader = request.headers.get('cookie');
  if (!cookieHeader) return null;

  const cookiesMap = parseCookies(cookieHeader);
  const token = cookiesMap[ADMIN_COOKIE_NAME];
  return verifySessionToken(token);
}

/**
 * Shared server-side helper to verify admin session on any incoming Request.
 * Returns { session } on success, or { session: null, errorResponse: 401 } on failure.
 */
export function requireAdminSession(request: Request): {
  session: SessionPayload;
  errorResponse?: never;
} | {
  session: null;
  errorResponse: NextResponse;
} {
  const session = getSessionFromRequest(request);
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized.' },
        { status: 401 }
      )
    };
  }
  return { session };
}

/**
 * Server-side helper to verify if the current server component request has an active admin session.
 */
export async function getAdminSessionFromCookies(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

/**
 * Helper to build Set-Cookie header options.
 */
export function getSessionCookieOptions(expiresInSeconds = 7 * 24 * 3600): string {
  const isProd = process.env.NODE_ENV === 'production';
  return [
    `Path=/`,
    `Max-Age=${expiresInSeconds}`,
    `HttpOnly`,
    `SameSite=Lax`,
    isProd ? `Secure` : ''
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Helper to build Set-Cookie header for clearing the session cookie on logout.
 */
export function getClearSessionCookieHeader(): string {
  const isProd = process.env.NODE_ENV === 'production';
  return [
    `${ADMIN_COOKIE_NAME}=`,
    `Path=/`,
    `Max-Age=0`,
    `Expires=Thu, 01 Jan 1970 00:00:00 GMT`,
    `HttpOnly`,
    `SameSite=Lax`,
    isProd ? `Secure` : ''
  ]
    .filter(Boolean)
    .join('; ');
}

/**
 * Simple cookie string parser.
 */
function parseCookies(cookieHeader: string): Record<string, string> {
  const list: Record<string, string> = {};
  cookieHeader.split(';').forEach((cookie) => {
    const parts = cookie.split('=');
    const name = parts.shift()?.trim();
    if (name) {
      list[name] = decodeURIComponent(parts.join('=').trim());
    }
  });
  return list;
}
