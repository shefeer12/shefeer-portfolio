import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import {
  generateCloudinaryUploadSignature,
  isCloudinaryServerConfigured
} from '@/lib/cloudinary-server';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: Request) {
  // 1. Shared server-side helper verifies the session cookie first
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  // 2. Rate limit uploads per IP: 30 signature requests per 10 minutes
  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`upload-sign:${ip}`, 30, 10 * 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }

  if (!isCloudinaryServerConfigured()) {
    return NextResponse.json(
      {
        error:
          'Cloudinary server credentials are not configured.'
      },
      { status: 500 }
    );
  }

  try {
    // Signs ONLY parameters chosen by the server (fixed folder, timestamp, resource_type: video)
    // Client-supplied parameters are completely ignored.
    const signatureData = generateCloudinaryUploadSignature();

    return NextResponse.json({
      success: true,
      ...signatureData
    });
  } catch (err) {
    console.error('[Admin Cloudinary Sign Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to generate upload signature.' },
      { status: 500 }
    );
  }
}
