import { NextResponse } from 'next/server';
import { requireAdminSession } from '@/lib/auth';
import { type Project, type ProjectCategory } from '@/lib/projects';
import { mutateProjectsAndPublish, loadProjects } from '@/lib/github';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { validateProjectPayload } from '@/lib/project-schema';

/**
 * Generates a clean URL slug from a title.
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * GET: Retrieve all projects from GitHub (in production) or data/projects.json (in development).
 */
export async function GET(request: Request) {
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const projects = await loadProjects();
    return NextResponse.json({ success: true, projects });
  } catch (err) {
    console.error('[Admin Projects GET Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to retrieve projects list.' },
      { status: 500 }
    );
  }
}

/**
 * POST: Create and publish a new project.
 * Uses atomic in-memory mutation and commit to GitHub contents API with conflict retry.
 */
export async function POST(request: Request) {
  const auth = requireAdminSession(request);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  const ip = getClientIp(request.headers);
  const rateLimit = checkRateLimit(`project-mutate:${ip}`, 40, 10 * 60);
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please wait a moment before trying again.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    // Schema validation (title, category, aspect ratio, integer order, tag limits, URL allowlist, unknown fields)
    const validation = validateProjectPayload(body, false);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.errors.join(' ') },
        { status: 400 }
      );
    }

    const {
      title,
      description,
      category,
      videoUrl,
      thumbnailUrl,
      aspectRatio = '9:16',
      duration,
      durationSeconds,
      year = new Date().getFullYear().toString(),
      client,
      role,
      brief,
      overview,
      editingApproach,
      tools,
      tags,
      order,
      published = true
    } = body;

    const validThumbnail = thumbnailUrl || videoUrl.replace(/\.(mp4|mov|webm)$/i, '.jpg');

    // Execute mutation with GitHub commit & conflict retry
    const publishResult = await mutateProjectsAndPublish((currentProjects) => {
      // Generate unique slug ID against fresh currentProjects
      let slug = body.id ? slugify(body.id) : slugify(title);
      if (!slug) slug = `project-${Date.now()}`;

      let uniqueSlug = slug;
      let counter = 1;
      while (currentProjects.some((p) => p.id === uniqueSlug)) {
        uniqueSlug = `${slug}-${counter}`;
        counter++;
      }

      // Determine order
      const nextOrder =
        typeof order === 'number' && order > 0
          ? order
          : Math.max(...currentProjects.map((p) => p.order || 0), 0) + 1;

      const newProject: Project = {
        id: uniqueSlug,
        order: nextOrder,
        title: title.trim(),
        description: description ? description.trim() : undefined,
        category: (category as ProjectCategory) || 'Shorts & Reels',
        year: year ? String(year).trim() : '2025',
        duration: duration ? String(duration).trim() : undefined,
        durationSeconds:
          typeof durationSeconds === 'number' && durationSeconds > 0
            ? durationSeconds
            : undefined,
        aspectRatio: aspectRatio.trim(),
        featured: false,
        published: Boolean(published),
        client: client ? client.trim() : undefined,
        role: role ? role.trim() : 'Video Edit · Pacing & Polish',
        thumbnailUrl: validThumbnail.trim(),
        thumbnail: validThumbnail.trim(),
        videoUrl: videoUrl.trim(),
        videoType: videoUrl.includes('cloudinary') ? 'cloudinary' : 'html5',
        isDemoPlaceholder: false,
        brief: brief ? brief.trim() : undefined,
        overview: overview ? overview.trim() : undefined,
        editingApproach: editingApproach || undefined,
        tools: Array.isArray(tools) && tools.length > 0 ? tools : ['Adobe Premiere Pro'],
        tags: Array.isArray(tags) ? tags : ['Vertical Video', 'Social Edit']
      };

      const updatedProjects = [...currentProjects, newProject].sort((a, b) => a.order - b.order);

      return {
        updatedProjects,
        commitMessage: `admin: add project "${newProject.title}"`,
        resultData: newProject
      };
    });

    if (!publishResult.success) {
      console.error('[Admin Project Create Publish Failure]:', publishResult.error || publishResult.message);
      return NextResponse.json(
        { error: 'Failed to publish project to repository.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      project: publishResult.resultData,
      publish: publishResult
    });
  } catch (err) {
    console.error('[Admin Project Create Error]:', err instanceof Error ? err.message : 'Unknown error');
    return NextResponse.json(
      { error: 'An unexpected error occurred while saving the project.' },
      { status: 500 }
    );
  }
}
