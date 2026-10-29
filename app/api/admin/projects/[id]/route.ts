import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { isValidAspectRatio, type Project } from '@/lib/projects';
import { persistProjectsAndPublish, readProjectsFromDisk } from '@/lib/github';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT: Update an existing project
 */
export async function PUT(request: Request, { params }: Params) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const projects = await readProjectsFromDisk();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `Project with ID "${id}" not found.` }, { status: 404 });
  }

  const existing = projects[index];

  // Protect hero project featured flag from being accidentally unset
  const isHero = Boolean(existing.featured);

  if (body.aspectRatio && !isValidAspectRatio(body.aspectRatio)) {
    return NextResponse.json({ error: 'Invalid aspect ratio format.' }, { status: 400 });
  }

  const updatedProject: Project = {
    ...existing,
    ...body,
    id: existing.id, // Immutable ID to preserve references
    featured: isHero ? true : Boolean(body.featured),
    order: typeof body.order === 'number' ? body.order : existing.order,
    thumbnailUrl: body.thumbnailUrl || body.thumbnail || existing.thumbnailUrl,
    thumbnail: body.thumbnailUrl || body.thumbnail || existing.thumbnail
  };

  projects[index] = updatedProject;
  projects.sort((a, b) => a.order - b.order);

  const publishResult = await persistProjectsAndPublish(
    projects,
    `update project "${updatedProject.title}"`
  );

  return NextResponse.json({
    success: true,
    project: updatedProject,
    publish: publishResult
  });
}

/**
 * DELETE: Remove a project (Hero protected)
 */
export async function DELETE(request: Request, { params }: Params) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  const projects = await readProjectsFromDisk();
  const project = projects.find((p) => p.id === id);

  if (!project) {
    return NextResponse.json({ error: `Project with ID "${id}" not found.` }, { status: 404 });
  }

  // Hero Protection Rule
  if (project.featured || project.id === 'hanansha-home') {
    return NextResponse.json(
      { error: 'Cannot delete the Hero showcase project. The website requires an active hero video.' },
      { status: 403 }
    );
  }

  const filtered = projects.filter((p) => p.id !== id);

  const publishResult = await persistProjectsAndPublish(
    filtered,
    `delete project "${project.title}"`
  );

  return NextResponse.json({
    success: true,
    deletedId: id,
    publish: publishResult
  });
}

/**
 * PATCH: Quick toggle publication status or update order
 */
export async function PATCH(request: Request, { params }: Params) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const projects = await readProjectsFromDisk();
  const index = projects.findIndex((p) => p.id === id);

  if (index === -1) {
    return NextResponse.json({ error: `Project with ID "${id}" not found.` }, { status: 404 });
  }

  const project = projects[index];

  if (typeof body.published === 'boolean') {
    project.published = body.published;
  }

  if (typeof body.order === 'number') {
    project.order = body.order;
  }

  projects.sort((a, b) => a.order - b.order);

  const publishResult = await persistProjectsAndPublish(
    projects,
    `update status for "${project.title}"`
  );

  return NextResponse.json({
    success: true,
    project,
    publish: publishResult
  });
}
