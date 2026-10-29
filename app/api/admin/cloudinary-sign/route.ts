import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import {
  generateCloudinaryUploadSignature,
  isCloudinaryServerConfigured
} from '@/lib/cloudinary-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // 1. Verify authorization
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized. Please log in to the admin dashboard.' },
      { status: 401 }
    );
  }

  // 2. Rate limit uploads per IP: 30 signature requests per 10 minutes
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`upload-sign:${ip}`, 30, 10 * 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: `Upload rate limit reached. Please wait ${rateLimit.retryAfterSeconds} seconds.` },
      { status: 429 }
    );
  }

  if (!isCloudinaryServerConfigured()) {
    return NextResponse.json(
      {
        error:
          'Cloudinary server credentials (CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) are not configured on this server.'
      },
      { status: 500 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const folder =
      body.folder || 'Muhammed Shefeer K | Video Editing Portfolio/01_Social_Media_Reels';

    const signatureData = generateCloudinaryUploadSignature(folder);

    return NextResponse.json({
      success: true,
      ...signatureData
    });
  } catch (err) {
    console.error('Cloudinary signature error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to generate upload signature.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
