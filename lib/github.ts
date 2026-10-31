import fs from 'fs';
import path from 'path';
import type { Project } from '@/lib/projects';
import { validateProjects } from '@/lib/projects';

export interface GitHubPublishResult {
  success: boolean;
  mode: 'github' | 'local';
  commitSha?: string;
  commitUrl?: string;
  message: string;
  error?: string;
  resultData?: any;
}

export interface GitHubConfigStatus {
  mode: 'GitHub' | 'Local';
  isConfigured: boolean;
  isProduction: boolean;
  owner?: string;
  repo?: string;
  branch: string;
  hasToken: boolean;
  variables: {
    GITHUB_TOKEN: 'set' | 'missing';
    GITHUB_OWNER: 'set' | 'missing';
    GITHUB_REPO: 'set' | 'missing';
    GITHUB_BRANCH: 'set' | 'missing';
  };
  missingRequired: string[];
}

export interface GitHubTestResult {
  success: boolean;
  step: 'config' | 'auth' | 'repo' | 'permissions' | 'branch' | 'file' | 'completed';
  message: string;
  details?: {
    owner?: string;
    repo?: string;
    branch?: string;
    hasWritePermission?: boolean;
    fileSha?: string;
  };
}

/**
 * Returns parsed GitHub configuration from environment variables.
 * Required: GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO.
 * Optional: GITHUB_BRANCH (default 'main').
 */
export function getGitHubConfig(): {
  token?: string;
  owner?: string;
  repo?: string;
  branch: string;
} {
  const token = process.env.GITHUB_TOKEN || process.env.GITHUB_ACCESS_TOKEN;
  let owner = process.env.GITHUB_OWNER || process.env.GITHUB_USER;
  let repo = process.env.GITHUB_REPO || process.env.GITHUB_REPOSITORY_NAME;

  if (process.env.GITHUB_REPOSITORY && process.env.GITHUB_REPOSITORY.includes('/')) {
    const parts = process.env.GITHUB_REPOSITORY.split('/');
    if (!owner) owner = parts[0];
    if (!repo) repo = parts[1];
  }

  const branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || 'main';

  return { token, owner, repo, branch };
}

/**
 * Returns configuration status for diagnostics on the admin dashboard.
 * Evaluates whether required variables are set without exposing secrets.
 */
export function getGitHubConfigStatus(): GitHubConfigStatus {
  const isProduction = process.env.NODE_ENV === 'production';
  const { token, owner, repo, branch } = getGitHubConfig();

  const missingRequired: string[] = [];
  if (!token) missingRequired.push('GITHUB_TOKEN');
  if (!owner) missingRequired.push('GITHUB_OWNER');
  if (!repo) missingRequired.push('GITHUB_REPO');

  const isConfigured = missingRequired.length === 0;
  const mode: 'GitHub' | 'Local' = isConfigured
    ? 'GitHub'
    : isProduction
    ? 'GitHub'
    : 'Local';

  return {
    mode,
    isConfigured,
    isProduction,
    owner: owner || undefined,
    repo: repo || undefined,
    branch,
    hasToken: Boolean(token),
    variables: {
      GITHUB_TOKEN: token ? 'set' : 'missing',
      GITHUB_OWNER: owner ? 'set' : 'missing',
      GITHUB_REPO: repo ? 'set' : 'missing',
      GITHUB_BRANCH:
        process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF
          ? 'set'
          : 'missing'
    },
    missingRequired
  };
}

/**
 * Reads the latest projects from disk.
 * Used in development or as a fallback for initial static loads.
 */
export async function readProjectsFromDisk(): Promise<Project[]> {
  const filePath = path.join(process.cwd(), 'data', 'projects.json');
  try {
    if (fs.existsSync(filePath)) {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading data/projects.json from disk:', err);
  }
  return [];
}

/**
 * Saves projects to the local `data/projects.json` file on disk.
 * Strictly forbidden in production (NODE_ENV === 'production').
 */
export async function saveProjectsToDisk(projects: Project[]): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Local filesystem write is forbidden in production.');
  }

  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'projects.json');

  if (!fs.existsSync(dataDir)) {
    await fs.promises.mkdir(dataDir, { recursive: true });
  }

  const jsonContent = JSON.stringify(projects, null, 2) + '\n';
  await fs.promises.writeFile(filePath, jsonContent, 'utf8');
}

/**
 * Fetches current data/projects.json directly from GitHub contents API.
 * Returns the parsed projects and the file's current SHA for atomic updates.
 */
export async function fetchProjectsFromGitHub(): Promise<{
  projects: Project[];
  sha: string;
}> {
  const { token, owner, repo, branch } = getGitHubConfig();

  if (!token || !owner || !repo) {
    throw new Error('GitHub configuration is incomplete.');
  }

  const apiPath = `https://api.github.com/repos/${owner}/${repo}/contents/data/projects.json?ref=${encodeURIComponent(
    branch
  )}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Shefeer-Portfolio-Admin/1.0'
  };

  const res = await fetch(apiPath, {
    method: 'GET',
    headers,
    cache: 'no-store'
  });

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    const message = errorJson.message || `HTTP ${res.status}`;
    throw new Error(`Failed to fetch data/projects.json from GitHub (${res.status}): ${message}`);
  }

  const data = await res.json();
  const rawContent = Buffer.from(data.content, 'base64').toString('utf8');
  const parsedProjects = JSON.parse(rawContent) as Project[];

  return {
    projects: parsedProjects,
    sha: data.sha
  };
}

/**
 * Loads current projects list.
 * In production when GitHub is configured, fetches from GitHub API to ensure fresh data.
 * Falls back to disk read if GitHub is unavailable or in development.
 */
export async function loadProjects(): Promise<Project[]> {
  const isProduction = process.env.NODE_ENV === 'production';
  const { isConfigured } = getGitHubConfigStatus();

  if (isProduction && isConfigured) {
    try {
      const { projects } = await fetchProjectsFromGitHub();
      return projects;
    } catch (err) {
      console.warn('Failed to load projects from GitHub, falling back to disk:', err);
    }
  }

  return readProjectsFromDisk();
}

/**
 * Read-only diagnostic test for GitHub connectivity and permissions.
 * Verifies credentials, repository access, write permissions, branch existence,
 * and data/projects.json without performing any write operation.
 */
export async function testGitHubConnection(): Promise<GitHubTestResult> {
  const { token, owner, repo, branch } = getGitHubConfig();

  const missing: string[] = [];
  if (!token) missing.push('GITHUB_TOKEN');
  if (!owner) missing.push('GITHUB_OWNER');
  if (!repo) missing.push('GITHUB_REPO');

  if (missing.length > 0) {
    return {
      success: false,
      step: 'config',
      message: `Missing required environment variable(s): ${missing.join(', ')}`
    };
  }

  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'User-Agent': 'Shefeer-Portfolio-Admin/1.0'
  };

  try {
    // 1. Verify repository access and token authentication
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
      cache: 'no-store'
    });

    if (repoRes.status === 401) {
      return {
        success: false,
        step: 'auth',
        message: 'Bad token: GITHUB_TOKEN is invalid, unauthorized, or expired.'
      };
    }

    if (repoRes.status === 404) {
      return {
        success: false,
        step: 'repo',
        message: `Repo not found: Repository "${owner}/${repo}" was not found or GITHUB_TOKEN lacks access.`
      };
    }

    if (!repoRes.ok) {
      const err = await repoRes.json().catch(() => ({}));
      return {
        success: false,
        step: 'repo',
        message: `GitHub repository check failed (${repoRes.status}): ${err.message || repoRes.statusText}`
      };
    }

    const repoData = await repoRes.json();

    // 2. Verify write / push permissions
    const permissions = repoData.permissions;
    if (permissions && permissions.push === false) {
      return {
        success: false,
        step: 'permissions',
        message: `No write permission: Token has read-only access to "${owner}/${repo}". Required scope: "Contents: Read and write".`
      };
    }

    // 3. Verify target branch existence
    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches/${encodeURIComponent(branch)}`,
      { headers, cache: 'no-store' }
    );

    if (branchRes.status === 404) {
      return {
        success: false,
        step: 'branch',
        message: `Branch not found: Branch "${branch}" does not exist in repository "${owner}/${repo}".`
      };
    }

    if (!branchRes.ok) {
      const err = await branchRes.json().catch(() => ({}));
      return {
        success: false,
        step: 'branch',
        message: `GitHub branch check failed (${branchRes.status}): ${err.message || branchRes.statusText}`
      };
    }

    // 4. Verify data/projects.json presence
    const fileRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/data/projects.json?ref=${encodeURIComponent(
        branch
      )}`,
      { headers, cache: 'no-store' }
    );

    if (fileRes.status === 404) {
      return {
        success: false,
        step: 'file',
        message: `File not found: "data/projects.json" was not found on branch "${branch}".`
      };
    }

    if (!fileRes.ok) {
      const err = await fileRes.json().catch(() => ({}));
      return {
        success: false,
        step: 'file',
        message: `GitHub file check failed (${fileRes.status}): ${err.message || fileRes.statusText}`
      };
    }

    const fileData = await fileRes.json();

    return {
      success: true,
      step: 'completed',
      message: `GitHub connection verified. Authenticated to "${owner}/${repo}" on branch "${branch}". Write permission confirmed. "data/projects.json" found (sha: ${fileData.sha?.substring(0, 7)}).`,
      details: {
        owner,
        repo,
        branch,
        hasWritePermission: permissions?.push !== false,
        fileSha: fileData.sha?.substring(0, 7)
      }
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      step: 'repo',
      message: `Network error connecting to GitHub API: ${errorMsg}`
    };
  }
}

/**
 * Executes a project mutation (add, edit, reorder, toggle, delete) in memory
 * and commits the result to GitHub with automated conflict retries (up to 3 attempts).
 *
 * Rules:
 * 1. In production (NODE_ENV === 'production'), local file fallback is strictly forbidden.
 *    If required env vars are missing, the save fails immediately.
 * 2. In production, no fs writes occur. The file is fetched from GitHub contents API,
 *    mutated in memory, validated against schema, and committed via PUT.
 * 3. On 409 or 422 conflict (stale sha), refetches latest contents, reapplies mutation,
 *    and retries up to 3 times.
 * 4. In development without GitHub config, saves to local disk.
 */
export async function mutateProjectsAndPublish(
  mutation: (currentProjects: Project[]) => {
    updatedProjects: Project[];
    commitMessage: string;
    resultData?: any;
  }
): Promise<GitHubPublishResult> {
  const isProduction = process.env.NODE_ENV === 'production';
  const { token, owner, repo, branch } = getGitHubConfig();

  const missingRequired: string[] = [];
  if (!token) missingRequired.push('GITHUB_TOKEN');
  if (!owner) missingRequired.push('GITHUB_OWNER');
  if (!repo) missingRequired.push('GITHUB_REPO');

  // Rule 1: Production must fail explicitly if any required variable is missing
  if (isProduction && missingRequired.length > 0) {
    return {
      success: false,
      mode: 'github',
      message: `Missing required environment variable(s) for GitHub auto-publishing: ${missingRequired.join(
        ', '
      )}. Local file fallback is not allowed in production.`,
      error: `Missing required variables: ${missingRequired.join(', ')}`
    };
  }

  // Development mode without GitHub config: Local file mode allowed
  if (!isProduction && missingRequired.length > 0) {
    try {
      const currentProjects = await readProjectsFromDisk();
      const { updatedProjects, resultData } = mutation(currentProjects);

      const validation = validateProjects(updatedProjects);
      if (!validation.valid) {
        return {
          success: false,
          mode: 'local',
          message: 'Project schema validation failed.',
          error: validation.errors.join('; ')
        };
      }

      await saveProjectsToDisk(updatedProjects);

      return {
        success: true,
        mode: 'local',
        message: 'Saved to local data/projects.json (Development Mode).',
        resultData
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        mode: 'local',
        message: 'Failed to write projects to local disk.',
        error: errorMsg
      };
    }
  }

  // GitHub Publishing Mode (Production, or Development with GitHub config)
  const apiPath = `https://api.github.com/repos/${owner}/${repo}/contents/data/projects.json`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'Shefeer-Portfolio-Admin/1.0'
  };

  const maxRetries = 3;
  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 1. Fetch current file and SHA from GitHub
      const getRes = await fetch(`${apiPath}?ref=${encodeURIComponent(branch)}`, {
        method: 'GET',
        headers,
        cache: 'no-store'
      });

      if (!getRes.ok) {
        const errJson = await getRes.json().catch(() => ({}));
        const msg = errJson.message || `HTTP ${getRes.status}`;
        return {
          success: false,
          mode: 'github',
          message: `Failed to fetch data/projects.json from GitHub (${getRes.status}): ${msg}`,
          error: msg
        };
      }

      const fileData = await getRes.json();
      const currentSha = fileData.sha;
      const rawJson = Buffer.from(fileData.content, 'base64').toString('utf8');
      const currentProjects = JSON.parse(rawJson) as Project[];

      // 2. Apply change in memory
      const { updatedProjects, commitMessage, resultData } = mutation(currentProjects);

      // 3. Validate against project schema
      const validation = validateProjects(updatedProjects);
      if (!validation.valid) {
        return {
          success: false,
          mode: 'github',
          message: 'Project validation failed.',
          error: validation.errors.join('; ')
        };
      }

      // 4. Encode content to base64
      const jsonString = JSON.stringify(updatedProjects, null, 2) + '\n';
      const base64Content = Buffer.from(jsonString, 'utf8').toString('base64');

      // 5. Commit to GitHub via PUT
      const putBody = {
        message: commitMessage,
        content: base64Content,
        sha: currentSha,
        branch
      };

      const putRes = await fetch(apiPath, {
        method: 'PUT',
        headers,
        body: JSON.stringify(putBody)
      });

      // Handle conflict (stale SHA: 409 Conflict or 422 Unprocessable)
      if (putRes.status === 409 || putRes.status === 422) {
        lastError = `GitHub SHA conflict (${putRes.status}) on attempt ${attempt}`;
        if (attempt < maxRetries) {
          // Jittered backoff before re-fetching
          await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
          continue;
        }
        return {
          success: false,
          mode: 'github',
          message:
            'Unable to commit changes due to concurrent updates on GitHub after 3 retries. Please refresh and try again.',
          error: lastError
        };
      }

      if (!putRes.ok) {
        const errorJson = await putRes.json().catch(() => ({}));
        const errorMsg = errorJson.message || `GitHub API error (${putRes.status})`;
        return {
          success: false,
          mode: 'github',
          message: `GitHub commit failed: ${errorMsg}`,
          error: errorMsg
        };
      }

      const commitData = await putRes.json();
      const commitSha = commitData.commit?.sha?.substring(0, 7) || 'latest';
      const commitUrl =
        commitData.commit?.html_url ||
        `https://github.com/${owner}/${repo}/commit/${commitData.commit?.sha || branch}`;

      // In development mode only, also keep local disk in sync
      if (!isProduction) {
        try {
          await saveProjectsToDisk(updatedProjects);
        } catch {
          // Non-critical in dev
        }
      }

      return {
        success: true,
        mode: 'github',
        commitSha,
        commitUrl,
        message: 'Saved and committed. The live site updates in about 1 to 2 minutes.',
        resultData
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        continue;
      }
    }
  }

  return {
    success: false,
    mode: 'github',
    message: 'Encountered an unexpected error while publishing to GitHub.',
    error: lastError
  };
}

/**
 * Backward-compatible wrapper for callers passing full projects array.
 */
export async function persistProjectsAndPublish(
  projects: Project[],
  actionDescription = 'update projects'
): Promise<GitHubPublishResult> {
  const commitMessage = actionDescription.startsWith('admin:')
    ? actionDescription
    : `admin: ${actionDescription}`;

  return mutateProjectsAndPublish(() => ({
    updatedProjects: projects,
    commitMessage
  }));
}
