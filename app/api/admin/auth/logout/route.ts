import { NextResponse } from 'next/server';
import { requireAdminSession, getClearSessionCookieHeader } from '@/lib/auth';

export async function POST(request: Request) {
  // Shared helper verifies session cookie first
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const response = NextResponse.json({
    success: true,
    message: 'Logged out successfully.'
  });

  // Clear cookie with full security flags
  response.headers.set('Set-Cookie', getClearSessionCookieHeader());

  return response;
}
