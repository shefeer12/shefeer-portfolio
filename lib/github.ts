import fs from 'fs';
import path from 'path';
import type { Project } from '@/lib/projects';

export interface GitHubPublishResult {
  success: boolean;
  publishedToGitHub: boolean;
  commitSha?: string;
  commitUrl?: string;
  message: string;
  error?: string;
}

export interface GitHubConfigStatus {
  isConfigured: boolean;
  owner?: string;
  repo?: string;
  branch?: string;
  hasToken: boolean;
}

/**
 * Returns the parsed GitHub repository configuration from environment variables.
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

  // If GITHUB_REPOSITORY is provided in "owner/repo" format (standard in GitHub Actions & Vercel)
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
 */
export function getGitHubConfigStatus(): GitHubConfigStatus {
  const { token, owner, repo, branch } = getGitHubConfig();
  const isConfigured = Boolean(token && owner && repo);
  return {
    isConfigured,
    owner: owner || undefined,
    repo: repo || undefined,
    branch,
    hasToken: Boolean(token)
  };
}

/**
 * Saves projects to the local `data/projects.json` file on disk.
 */
export async function saveProjectsToDisk(projects: Project[]): Promise<void> {
  const dataDir = path.join(process.cwd(), 'data');
  const filePath = path.join(dataDir, 'projects.json');

  if (!fs.existsSync(dataDir)) {
    await fs.promises.mkdir(dataDir, { recursive: true });
  }

  const jsonContent = JSON.stringify(projects, null, 2) + '\n';
  await fs.promises.writeFile(filePath, jsonContent, 'utf8');
}

/**
 * Reads the latest projects from disk, falling back to empty array if missing.
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
 * Saves projects to local disk AND commits changes to GitHub if configured.
 * Triggers automated Vercel deployment upon successful GitHub commit.
 */
export async function persistProjectsAndPublish(
  projects: Project[],
  actionDescription = 'update projects'
): Promise<GitHubPublishResult> {
  // 1. Always save to local disk first
  try {
    await saveProjectsToDisk(projects);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      publishedToGitHub: false,
      message: 'Failed to write projects to local disk.',
      error: errorMsg
    };
  }

  // 2. Check GitHub configuration
  const { token, owner, repo, branch } = getGitHubConfig();

  if (!token || !owner || !repo) {
    return {
      success: true,
      publishedToGitHub: false,
      message: 'Saved to local data/projects.json. To enable automatic Vercel deployments, configure GITHUB_TOKEN, GITHUB_OWNER, and GITHUB_REPO in your environment variables.'
    };
  }

  // 3. Commit to GitHub API
  try {
    const apiPath = `https://api.github.com/repos/${owner}/${repo}/contents/data/projects.json`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.v3+json',
      'Content-Type': 'application/json',
      'User-Agent': 'Shefeer-Portfolio-Admin/1.0'
    };

    // Get the current file SHA from GitHub
    let currentSha: string | undefined;
    const getRes = await fetch(`${apiPath}?ref=${branch}`, {
      method: 'GET',
      headers,
      cache: 'no-store'
    });

    if (getRes.ok) {
      const fileData = await getRes.json();
      currentSha = fileData.sha;
    } else if (getRes.status !== 404) {
      const errText = await getRes.text();
      console.warn('GitHub get contents warning:', getRes.status, errText);
    }

    // Prepare JSON content in base64
    const jsonString = JSON.stringify(projects, null, 2) + '\n';
    const base64Content = Buffer.from(jsonString).toString('base64');

    const commitMessage = `feat(portfolio): ${actionDescription} via admin dashboard`;

    const putBody: Record<string, string | undefined> = {
      message: commitMessage,
      content: base64Content,
      branch
    };

    if (currentSha) {
      putBody.sha = currentSha;
    }

    const putRes = await fetch(apiPath, {
      method: 'PUT',
      headers,
      body: JSON.stringify(putBody)
    });

    if (!putRes.ok) {
      const errorJson = await putRes.json().catch(() => ({}));
      const errorMsg = errorJson.message || `GitHub API error (${putRes.status})`;
      return {
        success: true,
        publishedToGitHub: false,
        message: 'Saved to local disk, but GitHub commit failed. Check your GITHUB_TOKEN permissions.',
        error: errorMsg
      };
    }

    const commitData = await putRes.json();
    const commitSha = commitData.commit?.sha?.substring(0, 7) || 'latest';
    const commitUrl = commitData.commit?.html_url || `https://github.com/${owner}/${repo}/commits/${branch}`;

    return {
      success: true,
      publishedToGitHub: true,
      commitSha,
      commitUrl,
      message: `Committed to GitHub (${commitSha}) on branch "${branch}". Vercel deployment triggered automatically.`
    };
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: true,
      publishedToGitHub: false,
      message: 'Saved to local disk, but encountered an error contacting GitHub.',
      error: errorMsg
    };
  }
}
