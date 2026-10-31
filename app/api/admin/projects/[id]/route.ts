import { NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/auth';
import { isValidAspectRatio, type Project } from '@/lib/projects';
import { mutateProjectsAndPublish } from '@/lib/github';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * PUT: Update an existing project.
 * Uses atomic in-memory mutation and commit to GitHub contents API with conflict retry.
 */
export async function PUT(request: Request, { params }: Params) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  if (body.aspectRatio && !isValidAspectRatio(body.aspectRatio)) {
    return NextResponse.json({ error: 'Invalid aspect ratio format.' }, { status: 400 });
  }

  try {
    const publishResult = await mutateProjectsAndPublish((currentProjects) => {
      const index = currentProjects.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`Project with ID "${id}" not found.`);
      }

      const existing = currentProjects[index];
      const isHero = Boolean(existing.featured);

      const updatedProject: Project = {
        ...existing,
        ...body,
        id: existing.id, // Immutable ID to preserve references
        featured: isHero ? true : Boolean(body.featured),
        order: typeof body.order === 'number' ? body.order : existing.order,
        thumbnailUrl: body.thumbnailUrl || body.thumbnail || existing.thumbnailUrl,
        thumbnail: body.thumbnailUrl || body.thumbnail || existing.thumbnail
      };

      const updatedProjects = [...currentProjects];
      updatedProjects[index] = updatedProject;
      updatedProjects.sort((a, b) => a.order - b.order);

      return {
        updatedProjects,
        commitMessage: `admin: update "${updatedProject.title}"`,
        resultData: updatedProject
      };
    });

    if (!publishResult.success) {
      const status = publishResult.error?.includes('not found') ? 404 : 500;
      return NextResponse.json(
        { error: publishResult.error || publishResult.message },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      project: publishResult.resultData,
      publish: publishResult
    });
  } catch (err) {
    console.error('Update project error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to update project.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * DELETE: Remove a project (Hero protected).
 * Uses atomic in-memory mutation and commit to GitHub contents API with conflict retry.
 */
export async function DELETE(request: Request, { params }: Params) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const publishResult = await mutateProjectsAndPublish((currentProjects) => {
      const project = currentProjects.find((p) => p.id === id);
      if (!project) {
        throw new Error(`Project with ID "${id}" not found.`);
      }

      // Hero Protection Rule
      if (project.featured || project.id === 'hanansha-home') {
        throw new Error('Cannot delete the Hero showcase project. The website requires an active hero video.');
      }

      const filtered = currentProjects.filter((p) => p.id !== id);

      return {
        updatedProjects: filtered,
        commitMessage: `admin: delete "${project.title}"`,
        resultData: project
      };
    });

    if (!publishResult.success) {
      const status = publishResult.error?.includes('Cannot delete')
        ? 403
        : publishResult.error?.includes('not found')
        ? 404
        : 500;
      return NextResponse.json(
        { error: publishResult.error || publishResult.message },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      publish: publishResult
    });
  } catch (err) {
    console.error('Delete project error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to delete project.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/**
 * PATCH: Quick toggle publication status or update order.
 * Uses atomic in-memory mutation and commit to GitHub contents API with conflict retry.
 */
export async function PATCH(request: Request, { params }: Params) {
  const session = getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const publishResult = await mutateProjectsAndPublish((currentProjects) => {
      const index = currentProjects.findIndex((p) => p.id === id);
      if (index === -1) {
        throw new Error(`Project with ID "${id}" not found.`);
      }

      const project = { ...currentProjects[index] };
      let commitMessage = `admin: update "${project.title}"`;

      if (typeof body.published === 'boolean') {
        project.published = body.published;
        commitMessage = `admin: hide/show "${project.title}"`;
      } else if (typeof body.order === 'number') {
        project.order = body.order;
        commitMessage = 'admin: reorder projects';
      }

      const updatedProjects = [...currentProjects];
      updatedProjects[index] = project;
      updatedProjects.sort((a, b) => a.order - b.order);

      return {
        updatedProjects,
        commitMessage,
        resultData: project
      };
    });

    if (!publishResult.success) {
      const status = publishResult.error?.includes('not found') ? 404 : 500;
      return NextResponse.json(
        { error: publishResult.error || publishResult.message },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      project: publishResult.resultData,
      publish: publishResult
    });
  } catch (err) {
    console.error('Patch project error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to update project.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
