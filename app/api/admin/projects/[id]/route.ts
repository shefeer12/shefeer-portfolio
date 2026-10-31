import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { type Project } from '@/lib/projects';
import { mutateProjectsAndPublish, loadProjects } from '@/lib/github';
import { validateProjectPayload } from '@/lib/project-schema';

interface Params {
  params: Promise<{ id: string }>;
}

/**
 * GET: Retrieve a single project by ID.
 * Requires admin session.
 */
export async function GET(request: Request, { params }: Params) {
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  try {
    const projects = await loadProjects();
    const project = projects.find((p) => p.id === id);
    if (!project) {
      return NextResponse.json({ error: 'Project not found.' }, { status: 404 });
    }
    return NextResponse.json({ success: true, project });
  } catch (err) {
    console.error('[Admin Project GET Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json({ error: 'Failed to retrieve project.' }, { status: 500 });
  }
}

/**
 * PUT: Update an existing project.
 * Uses atomic in-memory mutation and commit to GitHub contents API with conflict retry.
 */
export async function PUT(request: Request, { params }: Params) {
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  // Validate payload against schema and reject unknown fields
  const validation = validateProjectPayload(body, true);
  if (!validation.valid) {
    return NextResponse.json(
      { error: validation.errors.join(' ') },
      { status: 400 }
    );
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
      console.error('[Admin Project PUT Publish Failure]:', publishResult.error || publishResult.message);
      const status = publishResult.error?.includes('not found') ? 404 : 500;
      return NextResponse.json(
        { error: 'Failed to commit project updates.' },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      project: publishResult.resultData,
      publish: publishResult
    });
  } catch (err) {
    console.error('[Admin Project PUT Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while updating the project.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE: Remove a project (Hero protected).
 * Requires admin session and explicit hero check.
 */
export async function DELETE(request: Request, { params }: Params) {
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
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
      console.error('[Admin Project DELETE Publish Failure]:', publishResult.error || publishResult.message);
      const isProtected = publishResult.error?.includes('Cannot delete');
      const isNotFound = publishResult.error?.includes('not found');
      const status = isProtected ? 403 : isNotFound ? 404 : 500;
      return NextResponse.json(
        { error: isProtected ? 'Cannot delete the hero showcase project.' : 'Failed to delete project.' },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      deletedId: id,
      publish: publishResult
    });
  } catch (err) {
    console.error('[Admin Project DELETE Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while deleting the project.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH: Quick toggle publication status or update order.
 * Uses atomic in-memory mutation and commit to GitHub contents API with conflict retry.
 */
export async function PATCH(request: Request, { params }: Params) {
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);

  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Invalid patch payload.' }, { status: 400 });
  }

  // Reject unexpected patch fields
  const allowedPatchKeys = new Set(['published', 'order']);
  for (const k of Object.keys(body)) {
    if (!allowedPatchKeys.has(k)) {
      return NextResponse.json({ error: `Unexpected field "${k}" in patch request.` }, { status: 400 });
    }
  }

  if (body.order !== undefined && (!Number.isInteger(body.order) || body.order < 0)) {
    return NextResponse.json({ error: 'Order must be a non-negative integer.' }, { status: 400 });
  }

  if (body.published !== undefined && typeof body.published !== 'boolean') {
    return NextResponse.json({ error: 'Published must be a boolean.' }, { status: 400 });
  }

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
      console.error('[Admin Project PATCH Publish Failure]:', publishResult.error || publishResult.message);
      const status = publishResult.error?.includes('not found') ? 404 : 500;
      return NextResponse.json(
        { error: 'Failed to update project status.' },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      project: publishResult.resultData,
      publish: publishResult
    });
  } catch (err) {
    console.error('[Admin Project PATCH Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while patching the project.' },
      { status: 500 }
    );
  }
}
