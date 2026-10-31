'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Film,
  Github,
  Globe,
  HelpCircle,
  Layers,
  Lock,
  LogOut,
  MoveDown,
  MoveUp,
  Plus,
  RefreshCw,
  Sliders,
  Sparkles,
  Trash2,
  Upload,
  Video,
  X,
  AlertCircle
} from 'lucide-react';
import type { Project, ProjectCategory } from '@/lib/projects';

export default function AdminPage() {
  // ─── AUTH STATE ─────────────────────────────────────────────────────────────
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // ─── DASHBOARD STATE ────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'upload' | 'projects' | 'diagnostics'>('projects');
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [diagnostics, setDiagnostics] = useState<{
    cloudinary?: { configured: boolean; cloudName: string };
    github?: {
      mode: 'GitHub' | 'Local';
      isConfigured: boolean;
      isProduction: boolean;
      owner?: string;
      repo?: string;
      branch: string;
      variables?: {
        GITHUB_TOKEN: 'set' | 'missing';
        GITHUB_OWNER: 'set' | 'missing';
        GITHUB_REPO: 'set' | 'missing';
        GITHUB_BRANCH: 'set' | 'missing';
      };
      missingRequired?: string[];
    };
  }>({});

  // GitHub connection test state
  const [isTestingGitHub, setIsTestingGitHub] = useState(false);
  const [gitHubTestResult, setGitHubTestResult] = useState<{
    success: boolean;
    step: string;
    message: string;
    details?: {
      owner?: string;
      repo?: string;
      branch?: string;
      hasWritePermission?: boolean;
      fileSha?: string;
    };
  } | null>(null);

  // Notification banners
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    commitUrl?: string;
  } | null>(null);

  // ─── UPLOAD & FORM STATE ───────────────────────────────────────────────────
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Shorts & Reels');
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [videoUrl, setVideoUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [duration, setDuration] = useState('');
  const [durationSeconds, setDurationSeconds] = useState<number | undefined>(undefined);
  const [year, setYear] = useState('2025');
  const [client, setClient] = useState('');
  const [description, setDescription] = useState('');
  const [brief, setBrief] = useState('');
  const [order, setOrder] = useState<number>(1);
  const [published, setPublished] = useState(true);
  const [selectedTools, setSelectedTools] = useState<string[]>([
    'Adobe Premiere Pro',
    'Adobe After Effects'
  ]);

  // ─── EDIT MODAL STATE ──────────────────────────────────────────────────────
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editSaving, setEditSaving] = useState(false);

  // Check session on mount
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('/api/admin/auth/me');
      const data = await res.json();
      if (res.ok && data.authenticated) {
        setIsAuthenticated(true);
        setDiagnostics(data.diagnostics || {});
        fetchProjects();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  const fetchProjects = async () => {
    setLoadingProjects(true);
    try {
      const res = await fetch('/api/admin/projects');
      const data = await res.json();
      if (res.ok && Array.isArray(data.projects)) {
        setProjects(data.projects);
        // Calculate next default order
        const maxOrder = Math.max(...data.projects.map((p: Project) => p.order || 0), 0);
        setOrder(maxOrder + 1);
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleTestGitHubConnection = async () => {
    setIsTestingGitHub(true);
    setGitHubTestResult(null);
    try {
      const res = await fetch('/api/admin/auth/me?action=test-github', {
        method: 'POST'
      });
      const data = await res.json();
      setGitHubTestResult(data);
    } catch (err) {
      setGitHubTestResult({
        success: false,
        step: 'network',
        message: 'Network error: Failed to contact server to run GitHub diagnostic test.'
      });
    } finally {
      setIsTestingGitHub(false);
    }
  };

  // ─── AUTH ACTIONS ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;
    setAuthLoading(true);
    setAuthError('');

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput })
      });
      const data = await res.json();

      if (res.ok) {
        setIsAuthenticated(true);
        setPasswordInput('');
        checkSession();
      } else {
        setAuthError(data.error || 'Authentication failed. Please verify password.');
      }
    } catch {
      setAuthError('Connection error. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
    } finally {
      setIsAuthenticated(false);
      setProjects([]);
    }
  };

  // ─── VIDEO FILE SELECTION & PREVIEW ────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (max 250MB)
    const maxSize = 250 * 1024 * 1024;
    if (file.size > maxSize) {
      setUploadError('File exceeds 250MB maximum limit. Please compress before uploading.');
      return;
    }

    setUploadError('');
    setSelectedFile(file);

    // Auto-detect title from filename
    if (!title) {
      const cleanName = file.name
        .replace(/\.[^/.]+$/, '')
        .replace(/[_-]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase());
      setTitle(cleanName);
    }

    // Generate local preview & read metadata
    const objectUrl = URL.createObjectURL(file);
    setVideoPreviewUrl(objectUrl);

    // Create hidden video element to inspect true dimensions & duration
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.src = objectUrl;
    tempVideo.onloadedmetadata = () => {
      const w = tempVideo.videoWidth;
      const h = tempVideo.videoHeight;
      const d = tempVideo.duration;

      if (w && h) {
        if (h > w * 1.3) {
          setAspectRatio('9:16');
        } else if (w > h * 1.3) {
          setAspectRatio('16:9');
        } else if (Math.abs(w - h) < 50) {
          setAspectRatio('1:1');
        } else {
          setAspectRatio(`${w}:${h}`);
        }
      }

      if (Number.isFinite(d) && d > 0) {
        setDurationSeconds(Math.round(d * 100) / 100);
        const mins = Math.floor(d / 60);
        const secs = Math.floor(d % 60);
        setDuration(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
      }
    };
  };

  // ─── CLOUDINARY UPLOAD FLOW ────────────────────────────────────────────────
  const handleUploadToCloudinary = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError('');

    try {
      // 1. Request secure signed upload signature from our authenticated API
      const signRes = await fetch('/api/admin/cloudinary-sign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          folder: 'Muhammed Shefeer K | Video Editing Portfolio/01_Social_Media_Reels'
        })
      });

      if (!signRes.ok) {
        const signData = await signRes.json();
        throw new Error(signData.error || 'Failed to acquire upload signature.');
      }

      const signData = await signRes.json();

      // 2. Upload directly to Cloudinary using XMLHttpRequest for progress tracking
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('api_key', signData.apiKey);
      formData.append('timestamp', String(signData.timestamp));
      formData.append('signature', signData.signature);
      formData.append('folder', signData.folder);

      const xhr = new XMLHttpRequest();
      xhr.open('POST', signData.uploadUrl);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percent);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          const secureUrl = result.secure_url;
          setVideoUrl(secureUrl);

          // Generate Cloudinary poster thumbnail
          const thumb = secureUrl.replace(/\.(mp4|mov|webm)$/i, '.jpg');
          const optimizedThumb = thumb.includes('/video/upload/')
            ? thumb.replace('/video/upload/', '/video/upload/so_1,q_auto,f_auto/')
            : thumb;
          setThumbnailUrl(optimizedThumb);

          setIsUploading(false);
          setUploadProgress(100);
          setNotification({
            type: 'success',
            message: 'Video uploaded successfully to Cloudinary! Ready to publish.'
          });
        } else {
          setIsUploading(false);
          setUploadError(`Cloudinary upload failed (HTTP ${xhr.status}): ${xhr.responseText}`);
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        setUploadError('Network error during video upload. Please check connection and retry.');
      };

      xhr.send(formData);
    } catch (err) {
      setIsUploading(false);
      setUploadError(err instanceof Error ? err.message : 'Upload initialization failed.');
    }
  };

  // ─── PROJECT SUBMISSION (ADD) ──────────────────────────────────────────────
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) {
      setNotification({
        type: 'error',
        message: 'Please provide a project title and upload or specify a video URL.'
      });
      return;
    }

    setIsSubmitting(true);
    setNotification(null);

    const projectPayload = {
      title,
      description,
      category,
      aspectRatio,
      videoUrl,
      thumbnailUrl: thumbnailUrl || videoUrl.replace(/\.(mp4|mov|webm)$/i, '.jpg'),
      duration,
      durationSeconds,
      year,
      client,
      brief,
      order: Number(order) || 1,
      published,
      tools: selectedTools
    };

    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(projectPayload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        const commitMsg =
          data.publish?.commitUrl || data.publish?.mode === 'github'
            ? 'Saved and committed. The live site updates in about 1 to 2 minutes.'
            : data.publish?.message || 'Saved to local data/projects.json (Development Mode).';

        setNotification({
          type: 'success',
          message: commitMsg,
          commitUrl: data.publish?.commitUrl
        });

        // Reset form
        setTitle('');
        setDescription('');
        setBrief('');
        setVideoUrl('');
        setThumbnailUrl('');
        setSelectedFile(null);
        setVideoPreviewUrl(null);
        setUploadProgress(0);

        // Refresh project list and switch to projects view
        fetchProjects();
        setActiveTab('projects');
      } else {
        setNotification({
          type: 'error',
          message: data.error || 'Failed to publish project.'
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Failed to communicate with server.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── TOGGLE PUBLISH STATUS ─────────────────────────────────────────────────
  const handleTogglePublished = async (project: Project) => {
    try {
      const updatedStatus = !project.published;
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ published: updatedStatus })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === project.id ? { ...p, published: updatedStatus } : p))
        );
        const commitMsg =
          data.publish?.commitUrl || data.publish?.mode === 'github'
            ? 'Saved and committed. The live site updates in about 1 to 2 minutes.'
            : `Project "${project.title}" ${updatedStatus ? 'published' : 'hidden'}.`;
        setNotification({
          type: 'success',
          message: commitMsg,
          commitUrl: data.publish?.commitUrl
        });
      }
    } catch {
      setNotification({ type: 'error', message: 'Failed to update publish state.' });
    }
  };

  // ─── REORDER ACTIONS ───────────────────────────────────────────────────────
  const handleReorder = async (project: Project, direction: 'up' | 'down') => {
    if (project.featured) return; // Protect hero
    const currentIndex = projects.findIndex((p) => p.id === project.id);
    if (currentIndex === -1) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 1 || targetIndex >= projects.length) return; // Keep hero at 0

    const targetProject = projects[targetIndex];
    if (targetProject.featured) return;

    // Swap orders
    const newProjects = [...projects];
    const tempOrder = project.order;
    newProjects[currentIndex].order = targetProject.order;
    newProjects[targetIndex].order = tempOrder;
    newProjects.sort((a, b) => a.order - b.order);

    setProjects(newProjects);

    try {
      const res1 = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: targetProject.order })
      });
      const data1 = await res1.json().catch(() => ({}));

      const res2 = await fetch(`/api/admin/projects/${targetProject.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: tempOrder })
      });
      const data2 = await res2.json().catch(() => ({}));

      const commitUrl = data2.publish?.commitUrl || data1.publish?.commitUrl;
      const isGitHub = data2.publish?.mode === 'github' || data1.publish?.mode === 'github';

      setNotification({
        type: 'success',
        message:
          commitUrl || isGitHub
            ? 'Saved and committed. The live site updates in about 1 to 2 minutes.'
            : `Updated display order for "${project.title}".`,
        commitUrl
      });
    } catch {
      fetchProjects();
    }
  };

  // ─── DELETE PROJECT ────────────────────────────────────────────────────────
  const handleDelete = async (project: Project) => {
    if (project.featured || project.id === 'hanansha-home') {
      alert('The Hero showcase project is protected and cannot be deleted.');
      return;
    }

    if (!confirm(`Are you sure you want to delete "${project.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/projects/${project.id}`, {
        method: 'DELETE'
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProjects((prev) => prev.filter((p) => p.id !== project.id));
        const commitMsg =
          data.publish?.commitUrl || data.publish?.mode === 'github'
            ? 'Saved and committed. The live site updates in about 1 to 2 minutes.'
            : `Project "${project.title}" deleted.`;
        setNotification({
          type: 'success',
          message: commitMsg,
          commitUrl: data.publish?.commitUrl
        });
      } else {
        alert(data.error || 'Failed to delete project.');
      }
    } catch {
      alert('Error deleting project.');
    }
  };

  // ─── SAVE EDIT MODAL ───────────────────────────────────────────────────────
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    setEditSaving(true);
    try {
      const res = await fetch(`/api/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingProject)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? data.project : p))
        );
        setEditingProject(null);
        const commitMsg =
          data.publish?.commitUrl || data.publish?.mode === 'github'
            ? 'Saved and committed. The live site updates in about 1 to 2 minutes.'
            : `Project "${data.project.title}" updated successfully.`;
        setNotification({
          type: 'success',
          message: commitMsg,
          commitUrl: data.publish?.commitUrl
        });
      } else {
        alert(data.error || 'Failed to update project.');
      }
    } catch {
      alert('Network error while saving project.');
    } finally {
      setEditSaving(false);
    }
  };

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: LOADING STATE
  // ───────────────────────────────────────────────────────────────────────────
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070709] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-mono uppercase tracking-wider text-muted">
            Checking admin session...
          </p>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: LOGIN FORM (IF UNAUTHENTICATED)
  // ───────────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-[#070709] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#0c0c14] border border-white/10 rounded-lg p-6 sm:p-8 shadow-2xl relative z-10 space-y-6">
          <div className="space-y-2 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent/10 border border-accent/20 text-accent mb-2">
              <Lock className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white uppercase font-sans">
              SHEFEER <span className="text-accent">ADMIN</span>
            </h1>
            <p className="text-xs font-mono text-muted">
              Private video upload & content management console
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-[11px] font-mono uppercase tracking-wider text-white/70"
              >
                Admin Master Password
              </label>
              <div className="relative">
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password..."
                  required
                  autoFocus
                  className="w-full px-3.5 py-2.5 rounded bg-white/5 border border-white/10 text-white placeholder:text-muted/60 text-sm focus:outline-none focus:border-accent transition font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading || !passwordInput}
              className="w-full py-3 rounded bg-accent hover:bg-accent-hover text-black font-semibold text-xs uppercase tracking-wider font-mono transition flex items-center justify-center gap-2 shadow-lg shadow-accent/20 disabled:opacity-50"
            >
              {authLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Unlock Admin Console</span>
                </>
              )}
            </button>
          </form>

          <div className="pt-4 border-t border-white/5 text-center text-[10px] font-mono text-white/40 space-y-1">
            <p>Protected session with server-side validation.</p>
            <p className="text-white/30">
              Dev default password: <code className="text-accent/80">shefeer-edit-2026</code> (override in .env.local)
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ───────────────────────────────────────────────────────────────────────────
  // RENDER: AUTHENTICATED DASHBOARD
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#070709] pb-24">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-30 bg-[#09090f]/90 backdrop-blur-xl border-b border-white/10 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <a href="/" className="text-xl font-black text-white tracking-tighter">
              SHEFEER<span className="text-accent">.</span>
            </a>
            <span className="px-2 py-0.5 rounded bg-accent/15 border border-accent/30 text-accent text-[10px] font-mono uppercase tracking-wider font-bold">
              ADMIN DASHBOARD
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {/* Cloudinary Status Indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70 text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>CDN: {diagnostics.cloudinary?.cloudName || 'hvs5l0qz'}</span>
            </div>

            {/* GitHub Auto-Deploy Status */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 border border-white/10 text-white/70 text-[11px]">
              <Github className="w-3.5 h-3.5 text-accent" />
              <span>
                {diagnostics.github?.isConfigured
                  ? `GitHub Mode (${diagnostics.github.branch})`
                  : diagnostics.github?.isProduction
                  ? 'GitHub Mode (Missing Config)'
                  : 'Local File Mode'}
              </span>
            </div>

            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/90 hover:text-white transition"
            >
              <span>View Site</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>

            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1 px-3 py-1.5 rounded bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition"
              title="Sign out of admin session"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Notification Banner */}
        {notification && (
          <div
            className={`p-4 rounded-md border flex items-start justify-between gap-3 font-mono text-xs animate-in fade-in slide-in-from-top-2 duration-200 ${
              notification.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : notification.type === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-300'
                : 'bg-white/5 border-white/10 text-white'
            }`}
          >
            <div className="flex items-start gap-2.5">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold">{notification.message}</p>
                {notification.commitUrl && (
                  <a
                    href={notification.commitUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] underline underline-offset-2 hover:text-white"
                  >
                    <span>View commit on GitHub</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-white/40 hover:text-white transition"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Dashboard Tab Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-sm text-xs font-mono uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === 'projects'
                  ? 'bg-accent text-black font-bold shadow-md shadow-accent/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Film className="w-4 h-4" />
              <span>Project Registry ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-sm text-xs font-mono uppercase tracking-wider transition flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-accent text-black font-bold shadow-md shadow-accent/20'
                  : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Upload New Project</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('diagnostics')}
              className={`px-3 py-2 rounded-sm text-xs font-mono uppercase tracking-wider transition flex items-center gap-1.5 ${
                activeTab === 'diagnostics'
                  ? 'bg-accent text-black font-bold shadow-md shadow-accent/20'
                  : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Settings & Status</span>
            </button>
          </div>

          <button
            type="button"
            onClick={fetchProjects}
            className="p-2 rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition text-xs font-mono flex items-center gap-1.5"
            title="Refresh projects list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingProjects ? 'animate-spin' : ''}`} />
            <span>Reload</span>
          </button>
        </div>

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 1: ALL PROJECTS LIST & REORDERING                               */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-xs font-mono text-muted">
              <p>
                Showing all <span className="text-white font-bold">{projects.length}</span> published and draft projects.
                Changes save to <code className="text-accent">data/projects.json</code> and commit to GitHub automatically.
              </p>
            </div>

            {loadingProjects ? (
              <div className="py-20 text-center text-xs font-mono text-muted">
                <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Loading project registry...
              </div>
            ) : projects.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/10 rounded-lg p-6">
                <Film className="w-8 h-8 text-muted mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-white">No projects found in registry.</p>
                <p className="text-xs text-muted mt-1">Upload your first video project to begin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project, index) => {
                  const isHero = Boolean(project.featured) || project.order === 0;

                  return (
                    <div
                      key={project.id}
                      className={`p-3.5 sm:p-4 rounded border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isHero
                          ? 'bg-gradient-to-r from-accent/15 via-[#0e0e16] to-[#0c0c14] border-accent/40 shadow-lg shadow-accent/5'
                          : project.published
                          ? 'bg-[#0b0b12] border-white/10 hover:border-white/20'
                          : 'bg-[#07070b] border-white/5 opacity-60'
                      }`}
                    >
                      {/* Left: Thumbnail & Core Details */}
                      <div className="flex items-center gap-3.5 min-w-0 flex-1">
                        {/* Thumbnail preview */}
                        <div
                          className="w-14 h-20 sm:w-16 sm:h-24 rounded bg-black flex-shrink-0 bg-cover bg-center border border-white/10 relative overflow-hidden"
                          style={{ backgroundImage: `url("${project.thumbnailUrl || project.thumbnail}")` }}
                        >
                          <span className="absolute bottom-1 right-1 px-1 py-0.2 rounded bg-black/80 font-mono text-[8px] text-white">
                            {project.aspectRatio}
                          </span>
                        </div>

                        <div className="min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {isHero && (
                              <span className="px-2 py-0.5 rounded bg-accent text-black font-bold text-[9px] font-mono uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5 fill-current" /> HERO FEATURED
                              </span>
                            )}
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-accent">
                              Order #{project.order}
                            </span>
                            <span className="text-[10px] font-mono text-white/50">
                              {project.category}
                            </span>
                            {!project.published && (
                              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                                DRAFT (HIDDEN)
                              </span>
                            )}
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight truncate">
                            {project.title}
                          </h3>

                          <p className="text-xs text-muted line-clamp-1 font-light">
                            {project.description || project.brief || 'No description provided.'}
                          </p>

                          <div className="flex items-center gap-3 text-[10px] font-mono text-white/40">
                            <span>ID: {project.id}</span>
                            {project.duration && <span>· {project.duration}</span>}
                            {project.client && <span className="text-white/60">· {project.client}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions & Reordering */}
                      <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                        {/* Move Up / Down */}
                        {!isHero && (
                          <div className="flex items-center bg-white/5 rounded border border-white/10">
                            <button
                              type="button"
                              onClick={() => handleReorder(project, 'up')}
                              disabled={index <= 1}
                              className="p-1.5 hover:text-accent disabled:opacity-30 transition"
                              title="Move project up"
                            >
                              <MoveUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorder(project, 'down')}
                              disabled={index >= projects.length - 1}
                              className="p-1.5 hover:text-accent disabled:opacity-30 transition border-l border-white/10"
                              title="Move project down"
                            >
                              <MoveDown className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Toggle Publish / Hide */}
                        <button
                          type="button"
                          onClick={() => handleTogglePublished(project)}
                          className={`px-2.5 py-1.5 rounded border text-[11px] font-mono transition flex items-center gap-1.5 ${
                            project.published
                              ? 'bg-white/5 border-white/10 text-white/80 hover:text-white'
                              : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300'
                          }`}
                          title={project.published ? 'Hide from public portfolio' : 'Publish to live portfolio'}
                        >
                          {project.published ? (
                            <>
                              <Eye className="w-3 h-3 text-emerald-400" />
                              <span className="hidden sm:inline">Visible</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-yellow-400" />
                              <span>Hidden</span>
                            </>
                          )}
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditingProject({ ...project })}
                          className="px-3 py-1.5 rounded bg-white/10 hover:bg-accent hover:text-black text-white text-[11px] font-mono uppercase tracking-wider font-semibold transition"
                        >
                          Edit
                        </button>

                        {/* Delete Button (Hero Protected) */}
                        {!isHero && (
                          <button
                            type="button"
                            onClick={() => handleDelete(project)}
                            className="p-1.5 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 transition"
                            title="Delete project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 2: UPLOAD & CREATE NEW PROJECT                                 */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'upload' && (
          <div className="bg-[#0b0b12] border border-white/10 rounded-lg p-5 sm:p-7 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Upload className="w-5 h-5 text-accent" />
                Upload New Video Project
              </h2>
              <p className="text-xs font-mono text-muted mt-1">
                Upload your MP4 video cut directly to Cloudinary, auto-detect duration and ratio, and publish to your portfolio.
              </p>
            </div>

            {/* Video Input Mode Switcher */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-4">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase transition ${
                  uploadMode === 'file'
                    ? 'bg-accent text-black font-bold'
                    : 'bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                Direct File Upload (Cloudinary)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`px-3 py-1.5 rounded text-xs font-mono tracking-wider uppercase transition ${
                  uploadMode === 'url'
                    ? 'bg-accent text-black font-bold'
                    : 'bg-white/5 text-white/70 hover:text-white'
                }`}
              >
                Existing Video URL
              </button>
            </div>

            {/* Mode A: Drag & Drop Video File Upload */}
            {uploadMode === 'file' && (
              <div className="space-y-4">
                <div
                  className={`p-6 sm:p-8 rounded-lg border-2 border-dashed text-center transition-all ${
                    selectedFile
                      ? 'border-accent/40 bg-accent/5'
                      : 'border-white/15 bg-white/[0.01] hover:border-white/30'
                  }`}
                >
                  <input
                    type="file"
                    id="video-upload-input"
                    accept="video/mp4,video/quicktime,video/webm"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="video-upload-input"
                    className="cursor-pointer flex flex-col items-center gap-3"
                  >
                    <div className="w-12 h-12 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {selectedFile ? selectedFile.name : 'Click to select video or drag & drop'}
                      </p>
                      <p className="text-xs text-muted mt-1 font-mono">
                        Supports MP4, MOV, WebM (up to 250MB) · 9:16 vertical or 16:9
                      </p>
                    </div>
                  </label>
                </div>

                {uploadError && (
                  <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                    {uploadError}
                  </div>
                )}

                {/* Video Preview & Upload Trigger */}
                {selectedFile && (
                  <div className="p-4 rounded bg-white/[0.02] border border-white/10 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {videoPreviewUrl && (
                          <video
                            src={videoPreviewUrl}
                            className="w-16 h-24 object-cover rounded bg-black border border-white/10"
                            controls={false}
                            muted
                          />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-white truncate max-w-xs sm:max-w-md">
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] font-mono text-muted mt-0.5">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Detected Ratio:{' '}
                            <span className="text-accent font-bold">{aspectRatio}</span> · Duration:{' '}
                            <span className="text-white">{duration || 'Calculating...'}</span>
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleUploadToCloudinary}
                        disabled={isUploading || uploadProgress === 100}
                        className="w-full sm:w-auto px-5 py-2.5 rounded bg-accent hover:bg-accent-hover text-black font-semibold text-xs font-mono uppercase tracking-wider transition disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isUploading ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>Uploading ({uploadProgress}%)...</span>
                          </>
                        ) : uploadProgress === 100 ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>Uploaded to Cloudinary</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            <span>Upload to Cloudinary</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                      <div className="space-y-1.5">
                        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-accent transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] font-mono text-muted">
                          <span>Uploading video to Cloudinary CDN...</span>
                          <span className="text-white font-bold">{uploadProgress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Manual Video URL Entry */}
            {uploadMode === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-mono uppercase tracking-wider text-white/70">
                  Video Stream URL (Cloudinary / MP4)
                </label>
                <input
                  type="url"
                  value={videoUrl}
                  onChange={(e) => {
                    setVideoUrl(e.target.value);
                    if (!thumbnailUrl) {
                      setThumbnailUrl(e.target.value.replace(/\.(mp4|mov|webm)$/i, '.jpg'));
                    }
                  }}
                  placeholder="https://res.cloudinary.com/hvs5l0qz/video/upload/q_auto,f_auto/.../video.mp4"
                  className="w-full p-3 rounded bg-white/5 border border-white/10 text-white text-xs font-mono focus:border-accent focus:outline-none transition"
                />
              </div>
            )}

            {/* Project Details Metadata Form */}
            <form onSubmit={handleCreateProject} className="space-y-6 pt-4 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Urban Kinetic Reel"
                    className="w-full p-2.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:border-accent focus:outline-none transition"
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                    Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProjectCategory)}
                    className="w-full p-2.5 rounded bg-[#0e0e16] border border-white/10 text-white text-xs focus:border-accent focus:outline-none transition"
                  >
                    <option value="Shorts & Reels">Shorts & Reels</option>
                    <option value="Brand & Commercial">Brand & Commercial</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="Creator Edits">Creator Edits</option>
                  </select>
                </div>

                {/* Aspect Ratio */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                    Aspect Ratio *
                  </label>
                  <select
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full p-2.5 rounded bg-[#0e0e16] border border-white/10 text-white text-xs focus:border-accent focus:outline-none transition"
                  >
                    <option value="9:16">9:16 (Vertical Reel / Shorts)</option>
                    <option value="16:9">16:9 (Widescreen Landscape)</option>
                    <option value="1:1">1:1 (Square Feed)</option>
                    <option value="4:5">4:5 (Portrait Feed)</option>
                    <option value="2.39:1">2.39:1 (Cinematic Scope)</option>
                  </select>
                </div>

                {/* Display Order */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                    Display Position (Order)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={order}
                    onChange={(e) => setOrder(parseInt(e.target.value, 10))}
                    className="w-full p-2.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:border-accent focus:outline-none transition font-mono"
                  />
                </div>

                {/* Client or Talent */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                    Client / Talent (Optional)
                  </label>
                  <input
                    type="text"
                    value={client}
                    onChange={(e) => setClient(e.target.value)}
                    placeholder="e.g. Alphy Panjikaran, Brand Name"
                    className="w-full p-2.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:border-accent focus:outline-none transition"
                  />
                </div>

                {/* Duration */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                    Duration (mm:ss)
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="00:30"
                    className="w-full p-2.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:border-accent focus:outline-none transition font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                  Short Description
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Concise overview of what makes this edit distinctive..."
                  className="w-full p-2.5 rounded bg-white/5 border border-white/10 text-white text-xs focus:border-accent focus:outline-none transition"
                />
              </div>

              {/* Tools Checkboxes */}
              <div className="space-y-2">
                <label className="block text-[11px] font-mono uppercase tracking-wider text-white/70">
                  Editing Software Stack
                </label>
                <div className="flex flex-wrap gap-2 text-xs font-mono">
                  {[
                    'Adobe Premiere Pro',
                    'Adobe After Effects',
                    'CapCut',
                    'DaVinci Resolve',
                    'Adobe Photoshop',
                    'Canva'
                  ].map((tool) => {
                    const isChecked = selectedTools.includes(tool);
                    return (
                      <button
                        key={tool}
                        type="button"
                        onClick={() => {
                          if (isChecked) {
                            setSelectedTools(selectedTools.filter((t) => t !== tool));
                          } else {
                            setSelectedTools([...selectedTools, tool]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded border transition ${
                          isChecked
                            ? 'bg-accent/15 border-accent text-accent font-semibold'
                            : 'bg-white/5 border-white/10 text-white/60 hover:text-white'
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Published Toggle */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="published-toggle"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="w-4 h-4 accent-accent rounded"
                />
                <label htmlFor="published-toggle" className="text-xs font-mono text-white/90 cursor-pointer">
                  Publish immediately (Uncheck to save as draft / hidden)
                </label>
              </div>

              {/* Submit CTA */}
              <div className="pt-4 flex items-center justify-between border-t border-white/10">
                <p className="text-[11px] font-mono text-muted">
                  Saves to <code className="text-accent">data/projects.json</code> and triggers GitHub deploy.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting || !title || !videoUrl}
                  className="px-6 py-3 rounded bg-accent hover:bg-accent-hover text-black font-semibold text-xs font-mono uppercase tracking-wider transition shadow-lg shadow-accent/20 disabled:opacity-40 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Publish Project to Portfolio</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ─────────────────────────────────────────────────────────────────── */}
        {/* TAB 3: DIAGNOSTICS & GITHUB AUTO-DEPLOY SETTINGS                   */}
        {/* ─────────────────────────────────────────────────────────────────── */}
        {activeTab === 'diagnostics' && (
          <div className="space-y-6">
            <div className="bg-[#0b0b12] border border-white/10 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-accent" />
                  System Diagnostics & Environment
                </h3>
                <p className="text-xs font-mono text-muted mt-1">
                  Check connections to Cloudinary video hosting and GitHub auto-publishing.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Cloudinary Box */}
                <div className="p-4 rounded bg-white/[0.02] border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">1. Cloudinary Video CDN</span>
                    {diagnostics.cloudinary?.configured ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center gap-1">
                        <Check className="w-3 h-3" /> Ready
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-300 text-[10px]">
                        Missing Secret
                      </span>
                    )}
                  </div>
                  <p className="text-white/60 text-[11px] leading-relaxed">
                    Cloud Name: <code className="text-accent">{diagnostics.cloudinary?.cloudName}</code>
                  </p>
                  <p className="text-white/40 text-[10px]">
                    Direct signed uploads stream directly to Cloudinary without exposing API secrets to the browser.
                  </p>
                </div>

                {/* GitHub Box */}
                <div className="p-4 rounded bg-white/[0.02] border border-white/10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">2. GitHub & Vercel Publishing</span>
                    {diagnostics.github?.isConfigured ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center gap-1 font-semibold">
                        <Check className="w-3 h-3" /> GitHub Mode
                      </span>
                    ) : diagnostics.github?.isProduction ? (
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 text-[10px] font-semibold">
                        Missing Configuration
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-white/10 text-white/70 text-[10px] font-semibold">
                        Local File Mode
                      </span>
                    )}
                  </div>

                  {/* Mode & Target Info */}
                  <div className="space-y-1 text-[11px] leading-relaxed">
                    <p className="text-white/70">
                      Operating Mode:{' '}
                      <code className="text-accent font-bold">
                        {diagnostics.github?.mode === 'GitHub'
                          ? 'GitHub Publishing'
                          : 'Local File Mode (Development)'}
                      </code>
                    </p>
                    <p className="text-white/60">
                      Repository:{' '}
                      <code className="text-white/90">
                        {diagnostics.github?.owner && diagnostics.github?.repo
                          ? `${diagnostics.github.owner}/${diagnostics.github.repo}`
                          : 'Not configured'}
                      </code>
                    </p>
                    <p className="text-white/60">
                      Branch: <code className="text-white/80">{diagnostics.github?.branch || 'main'}</code>
                    </p>
                  </div>

                  {/* Environment Variables Checklist (Variable names only, never values) */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <p className="text-[10px] uppercase tracking-wider text-white/50 font-semibold">
                      Required Environment Variables:
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-white/70">GITHUB_TOKEN</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            diagnostics.github?.variables?.GITHUB_TOKEN === 'set'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {diagnostics.github?.variables?.GITHUB_TOKEN || 'missing'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-white/70">GITHUB_OWNER</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            diagnostics.github?.variables?.GITHUB_OWNER === 'set'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {diagnostics.github?.variables?.GITHUB_OWNER || 'missing'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-white/70">GITHUB_REPO</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            diagnostics.github?.variables?.GITHUB_REPO === 'set'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/20 text-red-400'
                          }`}
                        >
                          {diagnostics.github?.variables?.GITHUB_REPO || 'missing'}
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded bg-black/40 border border-white/5">
                        <span className="text-white/70">GITHUB_BRANCH</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-semibold ${
                            diagnostics.github?.variables?.GITHUB_BRANCH === 'set'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-white/10 text-white/50'
                          }`}
                        >
                          {diagnostics.github?.variables?.GITHUB_BRANCH || 'default (main)'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Read-Only Test Connection Button */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <button
                      type="button"
                      onClick={handleTestGitHubConnection}
                      disabled={isTestingGitHub}
                      className="w-full py-2 px-3 rounded bg-accent/15 hover:bg-accent/25 border border-accent/40 text-accent font-semibold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isTestingGitHub ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Testing Connection (Read-Only)...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Test GitHub Connection</span>
                        </>
                      )}
                    </button>

                    {/* Test Result Display */}
                    {gitHubTestResult && (
                      <div
                        className={`p-3 rounded text-xs leading-relaxed space-y-1 ${
                          gitHubTestResult.success
                            ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
                            : 'bg-red-500/10 border border-red-500/30 text-red-300'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {gitHubTestResult.success ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                          )}
                          <div>
                            <p className="font-bold">
                              {gitHubTestResult.success ? 'Connection Successful' : `Step Failed: ${gitHubTestResult.step}`}
                            </p>
                            <p className="text-[11px] opacity-90">{gitHubTestResult.message}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Setup Guide Accordion */}
              <div className="pt-4 border-t border-white/10 space-y-3 text-xs font-mono">
                <p className="text-accent font-semibold uppercase tracking-wider text-[11px]">
                  How to Enable GitHub Auto-Publishing on Vercel:
                </p>
                <ol className="list-decimal list-inside space-y-2 text-white/70 font-light leading-relaxed">
                  <li>
                    Create a GitHub Personal Access Token at{' '}
                    <code className="text-white">github.com/settings/tokens</code> with repository{' '}
                    <code className="text-accent">Contents: Read and write</code> scope.
                  </li>
                  <li>
                    Add these environment variables to your <code className="text-white">.env.local</code> and{' '}
                    <code className="text-white">Vercel Project Settings &gt; Environment Variables</code>:
                    <div className="mt-2 p-3 bg-black/60 rounded border border-white/10 text-white/90">
                      <code>
                        ADMIN_PASSWORD=your_secure_password
                        <br />
                        ADMIN_SESSION_SECRET=your_32_char_random_secret
                        <br />
                        GITHUB_TOKEN=ghp_your_github_token
                        <br />
                        GITHUB_OWNER=your_github_username
                        <br />
                        GITHUB_REPO=shefeer-portfolio
                        <br />
                        GITHUB_BRANCH=main
                      </code>
                    </div>
                  </li>
                  <li>
                    Every video upload will commit directly to <code className="text-white">data/projects.json</code>,
                    triggering a fresh Vercel build within ~60 seconds.
                  </li>
                </ol>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* EDIT PROJECT MODAL DIALOG                                           */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#0c0c14] border border-white/15 rounded-lg p-6 shadow-2xl my-auto space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Edit Project: <span className="text-accent">{editingProject.title}</span>
                </h3>
                <p className="text-[10px] font-mono text-muted">ID: {editingProject.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 rounded text-white/60 hover:text-white"
                aria-label="Close edit modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-white/70 block text-[10px] uppercase">Title</label>
                  <input
                    type="text"
                    required
                    value={editingProject.title}
                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:border-accent focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/70 block text-[10px] uppercase">Category</label>
                  <select
                    value={editingProject.category}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        category: e.target.value as ProjectCategory
                      })
                    }
                    className="w-full p-2 rounded bg-[#0e0e16] border border-white/10 text-white focus:border-accent focus:outline-none"
                  >
                    <option value="Shorts & Reels">Shorts & Reels</option>
                    <option value="Brand & Commercial">Brand & Commercial</option>
                    <option value="Cinematic">Cinematic</option>
                    <option value="Creator Edits">Creator Edits</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-white/70 block text-[10px] uppercase">Aspect Ratio</label>
                  <input
                    type="text"
                    value={editingProject.aspectRatio}
                    onChange={(e) =>
                      setEditingProject({ ...editingProject, aspectRatio: e.target.value })
                    }
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:border-accent focus:outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-white/70 block text-[10px] uppercase">Display Order</label>
                  <input
                    type="number"
                    value={editingProject.order}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        order: parseInt(e.target.value, 10) || 0
                      })
                    }
                    className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:border-accent focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-white/70 block text-[10px] uppercase">Video Stream URL</label>
                <input
                  type="url"
                  required
                  value={editingProject.videoUrl}
                  onChange={(e) => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                  className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:border-accent focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/70 block text-[10px] uppercase">Thumbnail / Poster URL</label>
                <input
                  type="url"
                  value={editingProject.thumbnailUrl}
                  onChange={(e) =>
                    setEditingProject({
                      ...editingProject,
                      thumbnailUrl: e.target.value,
                      thumbnail: e.target.value
                    })
                  }
                  className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:border-accent focus:outline-none font-mono text-[11px]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-white/70 block text-[10px] uppercase">Description</label>
                <textarea
                  rows={2}
                  value={editingProject.description || ''}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, description: e.target.value })
                  }
                  className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:border-accent focus:outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="edit-published"
                  checked={editingProject.published}
                  onChange={(e) =>
                    setEditingProject({ ...editingProject, published: e.target.checked })
                  }
                  className="w-4 h-4 accent-accent"
                />
                <label htmlFor="edit-published" className="text-white/90 text-xs cursor-pointer">
                  Publicly visible on website
                </label>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="px-4 py-2 rounded bg-white/5 hover:bg-white/10 text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  className="px-5 py-2 rounded bg-accent hover:bg-accent-hover text-black font-semibold text-xs uppercase tracking-wider flex items-center gap-2"
                >
                  {editSaving ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
