# SHEFEER_BRIEF.md: source of truth for the Muhammed Shefeer K portfolio

Sources: the client handover (primary) and the development chronicle (secondary). Where they disagree, **the handover wins** and the item is listed in section 12 to verify against the real repository. Anything unconfirmed is marked **VERIFY**. Do not fill gaps with guesses. Ask.

## 1. Identity
- Professional name: Muhammed Shefeer K. Display name: Shefeer. Title: Freelance Video Editor, 2+ years. Kochi, Kerala, India. Available for freelance projects. Audience: Indian and international clients.
- This is a **video editor's** portfolio, not a developer portfolio. The video work must be the strongest thing on the page.
- Contact details and socials live in `lib/site-config.ts`. Read them from there. Never duplicate or change them.
- Portrait: `/assets/shefeer.png`. Use only this real photo. Never generate, alter or replace his face.

## 2. Approved copy (do not replace with marketing language)
Headline: **TURNING RAW FOOTAGE INTO STORIES THAT CONNECT.**
About: "I'm Muhammed Shefeer K, a freelance video editor based in Kochi, Kerala, India. I help creators and businesses turn raw footage into polished, engaging videos for digital platforms." / "From short-form reels to longer videos, I focus on strong pacing, thoughtful cuts, clean visuals, and storytelling that keeps the audience interested." / "Every project has its own story. My goal is to understand your vision and shape the footage into a video that feels clear, intentional, and true to your message."

## 3. Design direction
Dark black background, white typography, one orange accent. Minimal, sophisticated, cinematic, confident, client-focused. Smooth, purposeful animation, **not excessive**. No generic templates, extra gradients, glow effects, decorative clutter, fake testimonials, fake stats or fake results.
References to study (do not copy): garcy.studio, exp.fiddle.digital, guillaumecolombel.fr.

## 4. Stack
Next.js, React, TypeScript, Tailwind CSS, Vercel, GitHub, Cloudinary. UI pieces: React Bits (ProfileCard, ElasticSlider), custom cinematic hero video components. Deployed on Vercel. Repo name `shefeer-portfolio`; **VERIFY** owner and branch from the actual project and Vercel settings. Do not invent URLs.

## 5. Page structure
Navigation, cinematic hero, full work gallery, project modal/player, About (with ProfileCard and software card), services/specialties, contact, floating WhatsApp button, private /admin.

## 6. Hero (approved, preserve)
- Wide cinematic background video in the center and right, headline and intro on the left, video blended into the dark background by a gradient.
- Dual-buffer A/B crossfade (about 800ms): next clip loads while the current one shows, no black flash. Starts muted for autoplay. SpeakerToggle (`components/SpeakerToggle.tsx`, `components/reactbits/SpeakerToggle.tsx`) mutes/unmutes; preference persists across clips; only one audio stream at a time. No notification behavior.
- Files: `components/CinematicHeroBackground.tsx`, `components/Hero.tsx`.
- Curated hero clips per the handover: `hanansha-home`, `attappady-travel`, `onroad-car-edit`, `alphy-actress-reel`. (The chronicle lists a different four. **VERIFY** which are in the code.)
- Hero rotation must **never** remove or filter projects from the main gallery. Hero changes must not affect the project player.
- Mobile: dark scrim for text readability, scaled headline, no overlapping controls. The floating WhatsApp button must not overlap the speaker control.

## 7. Gallery and project modal (preserve)
- The gallery shows the complete collection (portrait, landscape, square, custom ratios), uses real thumbnails, works on mobile, filtering if already present.
- **Single source of truth:** `data/projects.json` + `lib/projects.ts`. Never hardcode the project list in components.
- Card: thumbnail, title, category, aspect ratio, short description if present, opens the detail player.
- Modal: keep the existing player and the React Bits `ElasticSlider` timeline working. Responsive, easy to close, keyboard accessible, graceful load/playback errors.

## 8. Projects
- The handover says the registry holds **12** projects. The chronicle says **13**. **VERIFY the real count in `data/projects.json`.**
- Names confirmed in the handover: Alphy Panjikaran (and "Alphy Panjikaran Spotlight"), MES College Fest, Surya Pooja, Dr. Ananthu Podcast, Hanansha Luxury Home, Attappady Wilderness Journey, Night Highway Drift & Roll.
- Names that appear **only in the chronicle** and are unverified: Prime Property Ad Promo, Street Football Freestyle, Audi Black Edition Showcase, Saffron Culinary Visuals, Leadership Campaign Promo, Retail Fashion Launch Ad. They may be real, or leftover placeholder or AI-written entries. The handover says: do not invent the remaining names. Treat each as unverified until Shefeer confirms the video is his real work and the title is right.
- Permission to show the supplied projects publicly: confirmed (handover). Still never imply a named brand, person or campaign commissioned a project unless Shefeer confirms. When unsure, show only title and category.
- For each project show: title, category, video, short description, editing approach, tags, aspect ratio. No invented clients, outcomes or metrics.

## 9. About, ProfileCard and software (preserve)
ProfileCard (`ProfileCard.tsx`, `ProfileCard.css`, re-export `components/ProfileCard.tsx`): name Muhammed Shefeer K, title Freelance Video Editor, handle `reefehs_`, status Open for Projects, avatar `/assets/shefeer.png`, dark theme backdrop `#0e0e13`, holographic, glare, tilt, parallax, intro animation. Its contact action scrolls to Contact, WhatsApp as fallback. Keep the software card below it.
Software (show honestly): Premiere Pro, After Effects, CapCut = regular use. DaVinci Resolve = basic. Photoshop, Canva = additional tools. Adobe Audition = **not used, never show it.** Use logos/icons only where legally appropriate.

## 10. Services and policies
Services: short-form reels and social videos, YouTube editing, podcast editing and highlights, color correction and grading, subtitles and captions, cinematic edits, wedding and event highlights, commercials and promotional videos.
Pricing: **by quotation only. No public prices without Shefeer's approval.**
Policies discussed (publish only after Shefeer approves the wording): long-form yes, 2 revisions, flexible turnaround, rush accepted, INR. The current "Services & Commercial Terms" section must contain only these, nothing invented.

## 11. Admin and publishing pipeline
Reported features (**VERIFY each**): password login with HTTP-only signed cookie, dashboard, direct signed Cloudinary upload, add video by URL (Cloudinary, Vimeo, others), edit, replace video, reorder, hide/unpublish, delete, diagnostics tab. Data stored in `data/projects.json`.
Intended flow: login, signed upload straight to Cloudinary, save metadata, server updates `data/projects.json`, commit via GitHub API, GitHub triggers a Vercel build, live in about 60 seconds.
**Current status: NOT confirmed.** The last diagnostics screenshot showed Cloudinary "Ready" but GitHub/Vercel in **"Local File Mode"**, repo `/local`. So auto-publishing was not recognised. Possible causes to check in code and settings: missing or misnamed env vars in that environment, or the code silently falling back to local file writes. The diagram has a step "update local data/projects.json": on Vercel the filesystem is read-only, so in production the code must read the file from GitHub, change it in memory, and commit with the correct file `sha`. Never write to disk in production.
Env var **names** only (never print or commit values): `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `GITHUB_TOKEN`, `GITHUB_OWNER`, `GITHUB_REPO`, `GITHUB_BRANCH` (main), `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`. The GitHub token should have only the repository-contents permission it needs.

## 12. Known conflicts and unknowns
| Item | Handover | Chronicle | Action |
|---|---|---|---|
| Project count | 12 | 13 | read `data/projects.json` |
| Hero clips | hanansha-home, attappady-travel, onroad-car-edit, alphy-actress-reel | hanansha-home, audi-cinematic, mes-college-program, attappady-travel | read `CinematicHeroBackground.tsx` |
| Auto-publish | not confirmed (Local File Mode) | "working" | test for real |
| Build results | historical | historical | re-run |
| Commit list | 5 commits | 6 (adds afd5c16, headline proximity effect) | `git log` |

## 13. Security requirements
Password never reaches the browser; cookie HTTP-only, Secure in production, SameSite set, sessions expire; every `/api/admin/*` route checks the session server-side; Cloudinary signing and the GitHub token stay server-side; validate user URLs and metadata; sensible upload size and type limits; protected update and delete; errors never leak secrets. A working login does not mean it is secure.

## 14. Things only a human can do (the agent cannot)
Create the GitHub token on the repo owner's account, set Vercel environment variables, run the live upload test, rotate the admin password, confirm project titles and policy wording with Shefeer, and approve before pushing to `main`.
