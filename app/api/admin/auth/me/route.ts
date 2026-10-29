import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { isCloudinaryServerConfigured } from '@/lib/cloudinary-server';
import { getGitHubConfigStatus } from '@/lib/github';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const cloudinaryConfigured = isCloudinaryServerConfigured();
  const githubStatus = getGitHubConfigStatus();

  return NextResponse.json({
    authenticated: true,
    user: {
      username: session.u,
      expiresAt: session.exp
    },
    diagnostics: {
      cloudinary: {
        configured: cloudinaryConfigured,
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'hvs5l0qz'
      },
      github: githubStatus
    }
  });
}
