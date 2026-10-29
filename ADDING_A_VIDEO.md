# Shefeer Portfolio — Video Management & Admin Guide

The Shefeer Video Portfolio includes a **Private Administration Dashboard** at [`/admin`](http://localhost:3000/admin). You no longer need to edit source code files manually to add, update, reorder, or publish videos.

---

## 🚀 Quick Workflow: Adding a Video via `/admin`

### Step 1: Open the Admin Console
1. Navigate to `https://your-domain.com/admin` (or `http://localhost:3000/admin` locally).
2. Enter your master password (configured via `ADMIN_PASSWORD` in `.env.local` or Vercel Environment Variables).
3. Click **Unlock Admin Console**.

---

### Step 2: Upload Your Video File
1. Click the **Upload New Project** tab.
2. Drag and drop your rendered `.mp4`, `.mov`, or `.webm` video file (up to 250 MB).
3. The dashboard will instantly:
   - Generate a local video preview so you can watch your cut.
   - Automatically detect the true aspect ratio (e.g. `9:16`, `16:9`, `1:1`, `4:5`).
   - Automatically detect the exact video duration (e.g. `00:34`).
4. Click **Upload to Cloudinary**.
   - A real-time progress bar (0% to 100%) will display upload speed and percentage.
   - Upon upload, your secure video stream URL and optimized poster thumbnail are auto-filled into the form.

---

### Step 3: Complete Project Details
Fill in the project information:
- **Project Title**: e.g. *Urban Kinetic Reel*
- **Category**: Select `Shorts & Reels`, `Brand & Commercial`, `Cinematic`, or `Creator Edits`.
- **Client / Subject**: Optional talent or client name (e.g. *Alphy Panjikaran*).
- **Short Description**: 1–2 sentence summary of the edit.
- **Editing Software Stack**: Select the software tools used (`Premiere Pro`, `After Effects`, `CapCut`, etc.).
- **Display Position (Order)**: The order number in the gallery.
- **Publicly Visible**: Checked by default. (Uncheck to save as a draft).

---

### Step 4: Publish to Portfolio
Click **Publish Project to Portfolio**.

The dashboard automatically:
1. Validates the data against portfolio rules.
2. Updates `data/projects.json`.
3. Commits the change directly to your **GitHub repository** (when `GITHUB_TOKEN` is configured).
4. **Vercel** automatically detects the commit and deploys the updated website in ~60 seconds!

---

## 🛠️ Common Management Tasks in the Dashboard

### 1. How to Reorder Projects
- In the **Project Registry** tab, click the **Up** (↑) or **Down** (↓) arrows beside any project to swap positions.
- Alternatively, click **Edit** and enter a specific order number.

### 2. How to Temporarily Hide a Project (Unpublish)
- Click the **Eye icon (Visible)** on any project card. It will immediately switch to **Hidden (Draft)** and disappear from the live public gallery.
- Click it again whenever you want to restore it.

### 3. How to Edit Project Details
- Click the **Edit** button on any project card.
- Update the title, description, category, or URLs in the modal.
- Click **Save Changes**. The update is committed to GitHub and deployed.

### 4. Hero Showcase Protection
- The **Hero Showcase Cut** (`Hanansha Luxury Home`, Order #0) is automatically protected.
- It cannot be deleted or accidentally unset from the hero slot without administrator confirmation.

---

## 🔐 Environment Variables for Production

To enable direct Cloudinary uploads and automated GitHub-to-Vercel publishing, configure these environment variables in your **Vercel Dashboard &gt; Project Settings &gt; Environment Variables**:

| Variable | Description | Example |
|---|---|---|
| `ADMIN_PASSWORD` | Master password to unlock `/admin` | `YourSecretPassword123` |
| `ADMIN_SESSION_SECRET` | 32+ character string for secure cookie signing | `random_session_secret_salt_2026` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Public Cloudinary cloud name | `hvs5l0qz` |
| `CLOUDINARY_API_KEY` | Server-side Cloudinary API key | `725926333467647` |
| `CLOUDINARY_API_SECRET` | Server-side Cloudinary API secret | `LpjpDRnzKkesS1SATT39vGqR-2M` |
| `GITHUB_TOKEN` | GitHub Personal Access Token (`contents:write`) | `ghp_xxxxxxxxxxxx` |
| `GITHUB_OWNER` | Your GitHub username or organization | `shefeerk` |
| `GITHUB_REPO` | Your repository name | `shefeer-portfolio` |
| `GITHUB_BRANCH` | Production branch (default: `main`) | `main` |

---

## 📁 Technical Data Architecture

- **Data File**: [`data/projects.json`](file:///d:/project/shefeer-portfolio/data/projects.json)
- **TypeScript Registry**: [`lib/projects.ts`](file:///d:/project/shefeer-portfolio/lib/projects.ts)
- **Admin Dashboard Route**: [`/admin`](file:///d:/project/shefeer-portfolio/app/admin/page.tsx)
- **API Endpoints**:
  - `POST /api/admin/auth/login` — Authenticates password & sets secure session cookie.
  - `POST /api/admin/auth/logout` — Destroys session cookie.
  - `GET /api/admin/auth/me` — Checks session & reports system diagnostics.
  - `POST /api/admin/cloudinary-sign` — Generates signed upload parameters for Cloudinary.
  - `GET /api/admin/projects` — Retrieves latest project list.
  - `POST /api/admin/projects` — Adds a new project, writes JSON, and commits to GitHub.
  - `PUT /api/admin/projects/[id]` — Edits an existing project and commits to GitHub.
  - `DELETE /api/admin/projects/[id]` — Removes a project (Hero protected) and commits to GitHub.
  - `PATCH /api/admin/projects/[id]` — Toggles published status or changes display order.
