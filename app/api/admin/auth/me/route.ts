import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { isCloudinaryServerConfigured } from '@/lib/cloudinary-server';
import { getGitHubConfigStatus, testGitHubConnection } from '@/lib/github';

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get('action') === 'test-github') {
    const testResult = await testGitHubConnection();
    return NextResponse.json(testResult);
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

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const testResult = await testGitHubConnection();
  return NextResponse.json(testResult);
}
