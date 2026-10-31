# Muhammed Shefeer — Video Editor Portfolio

A cinematic, editorial portfolio website for independent video editor **Muhammed Shefeer**, built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**.

The site showcases Shefeer's commercial, documentary, and creator video editing work with vertical (9:16), horizontal (16:9), and square (1:1) video players, optimized Cloudinary streaming, and an integrated private admin dashboard connected directly to GitHub.

---

## 📖 Client Guide: Managing the Portfolio (`/admin`)

This guide is written in plain language for Shefeer to manage projects, videos, and settings without touching code.

### 1. How to Log In
1. Visit your live website URL and navigate to `/admin` (e.g., `https://your-domain.com/admin`).
2. Enter your admin password and click **Sign In**.
3. If you enter the wrong password 5 times consecutively, the login will be locked for 15 minutes for security.

---

### 2. Managing Projects

All changes made in `/admin` are saved directly to your site's data registry via GitHub.

#### Adding a New Project
1. In `/admin`, click **New Project** or select **Add Project**.
2. Fill in the project details:
   - **Title**: Project name.
   - **Category**: Commercial, Documentary, Short Form, Narrative, Color Grading, or Sound Design.
   - **Aspect Ratio**: 9:16 (vertical reel), 16:9 (widescreen), or 1:1 (square).
   - **Featured in Hero**: Check this box if you want this clip featured in the homepage hero background rotation.
   - **Description / Case Study**: Summary, client/context, hook strategy, sound design, and color grading notes.
3. Add the Video:
   - **Upload Video**: Choose an `.mp4`, `.mov`, or `.webm` video from your computer. The video will be uploaded directly to your Cloudinary media account.
   - **Add by URL**: If the video is already hosted on your Cloudinary account or Vimeo, paste the direct URL.
4. Click **Publish Project**.

#### Editing a Project
1. Find the project card in the `/admin` dashboard.
2. Click **Edit**.
3. Update any fields, text, category, or replace the video file/URL.
4. Click **Save Changes**.

#### Reordering Projects
- The order projects appear in `/admin` is the exact order they display on the public portfolio gallery.
- Use the **Move Up** and **Move Down** buttons (or drag handles) to position your best work first.
- Click **Save Order** to commit the new sequence.

#### Hiding or Showing a Project
- Next to each project in `/admin`, toggle the **Visible / Hidden** switch.
- Hidden projects remain safely saved in your database but will NOT be visible to public visitors.

#### Deleting a Project
- In the project editor or project card, click **Delete Project**.
- Confirm the prompt. Once deleted, the project is removed from the gallery on the next build.

---

### 3. How Long Updates Take to Show Live
- When you click Save, Add, or Delete, the admin dashboard makes an automated commit directly to your GitHub repository.
- This automated commit immediately triggers a new deployment on **Vercel**.
- **Update Duration**: It typically takes **1 to 2 minutes** for Vercel to rebuild and deploy the new version of your live site.
- Refresh your public website after 2 minutes to see your changes.

---

### 4. What to Do If an Upload Fails
If a video upload encounters an error:
1. **Check Video Format**: Confirm your video file is an `.mp4`, `.mov`, or `.webm` file. Other formats (such as raw `.mkv` or `.avi`) should first be exported from Premiere Pro or DaVinci Resolve as H.264/H.265 MP4.
2. **Check File Size**: Uploads over 100 MB may hit browser timeout limits. If uploading high-bitrate files, upload them directly to your [Cloudinary Console](https://cloudinary.com/console) and then use the **Add by URL** option in `/admin`.
3. **Check Cloudinary Status in Diagnostics**:
   - Scroll to the **Diagnostics** panel at the bottom of `/admin`.
   - Verify that Cloudinary reports **Configured**.
   - If Cloudinary reports missing configuration, check your Vercel Environment Variables.
4. **Internet Connection**: Slow or unstable upload connections may drop during multi-megabyte transfers. Try re-uploading on a stable connection.

---

### 5. How to Change the Admin Password
The admin password is stored securely in your deployment environment variables, never in the code.
1. Log in to your [Vercel Dashboard](https://vercel.com/).
2. Select your `shefeer-portfolio` project.
3. Go to **Settings** > **Environment Variables**.
4. Locate `ADMIN_PASSWORD` and click **Edit**.
5. Enter your new secure password and save.
6. **Rotate Session Secret (Recommended)**: To immediately sign out all active sessions on other devices, edit `ADMIN_SESSION_SECRET` with a new random string (e.g., 32 random letters/numbers).
7. Go to the **Deployments** tab and click **Redeploy** on the latest deployment for the new password to take effect.

---

### 6. How to Revoke or Regenerate the GitHub Token
If you ever suspect your GitHub token was compromised or expired:
1. Log in to [GitHub](https://github.com/).
2. Click your profile avatar in the top right > **Settings**.
3. In the left sidebar, scroll down and click **Developer settings** > **Personal access tokens** > **Tokens (classic)**.
4. Find your portfolio token (or create a new one):
   - To revoke: Click **Delete** next to the old token.
   - To generate a new one: Click **Generate new token (classic)**, set Note to `Shefeer Portfolio Admin`, expiration as desired, and check the `repo` scope (Full control of private repositories). Copy the new token string.
5. In your [Vercel Dashboard](https://vercel.com/):
   - Go to **Settings** > **Environment Variables**.
   - Edit `GITHUB_TOKEN` and paste your new token. Save.
6. Redeploy the latest commit on Vercel.

---

## 🛠️ Developer & Environment Setup

### Environment Variables
Configure the following in `.env.local` (local development) and in Vercel (Production):

| Variable Name | Purpose | Required in Prod |
|---|---|---|
| `ADMIN_PASSWORD` | Password used to log in at `/admin` | Yes |
| `ADMIN_SESSION_SECRET` | Secret key used to sign HMAC session cookies | Yes |
| `GITHUB_TOKEN` | GitHub Personal Access Token (`repo` scope) for committing data changes | Yes |
| `GITHUB_OWNER` | GitHub username or organization owning the repository | Yes |
| `GITHUB_REPO` | GitHub repository name (e.g., `shefeer-portfolio`) | Yes |
| `GITHUB_BRANCH` | Target branch to commit changes to (default: `main`) | Optional |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name for media asset delivery | Yes |
| `CLOUDINARY_API_KEY` | Cloudinary API Key for generating signed upload signatures | Yes |
| `CLOUDINARY_API_SECRET` | Cloudinary API Secret for upload signatures | Yes |

> **Note:** Never commit `.env` or `.env.local` files to Git. Keep all secrets secure in Vercel settings.

### Local Development Commands
```bash
# Install dependencies
npm install

# Start local development server (running on port 3010)
npm run dev -- -p 3010

# Type-check TypeScript code
npx tsc --noEmit

# Test production build
npm run build
```

---

## 📐 Project Architecture

- **`app/page.tsx`**: Main portfolio page assembling Hero, Gallery, Showreel, Services, About, and Contact.
- **`app/admin/`**: Private administrative control panel for project management.
- **`app/api/admin/`**: Secure serverless API endpoints protected by timing-safe HMAC sessions, IP rate limiting, and Zod schema validation.
- **`lib/cloudinary-url.ts`**: Unified helper transforming media URLs with `f_auto,q_auto`, responsive widths, first-frame posters, and preview clips.
- **`lib/github.ts`**: Git publishing engine that commits updates directly to `data/projects.json` with conflict resolution and exponential backoff retry.
- **`data/projects.json`**: Source of truth project registry containing metadata, categories, aspect ratios, and video IDs.
