# AGENTS.md: rules for any coding agent working on Shefeer's portfolio

Project: portfolio for Muhammed Shefeer K, freelance video editor. Existing, deployed Next.js site with a private admin dashboard.
Read this file and `SHEFEER_BRIEF.md` before every task. If they conflict, this file wins.
**You are continuing an existing project. Do not rebuild it from scratch, and do not make design changes just to look busy.**

## 1. Preserve (client-approved, do not replace)
Cinematic hero and its dual-buffer crossfade, SpeakerToggle, gallery, project modal and ElasticSlider, About section, ProfileCard, software card, admin dashboard, Cloudinary and GitHub integrations, approved copy, and the portrait file. Improve carefully; never swap them out.

## 2. Touch-only-when-the-prompt-says-so
`lib/auth.ts`, `lib/github.ts`, `lib/cloudinary-server.ts`, `app/api/admin/**`, `app/admin/**`, the shape of `data/projects.json`, and the contact values in `lib/site-config.ts`. Only Prompts 2 and 3 may change the admin and publishing code.

## 3. Accuracy rules (non-negotiable)
- Never invent clients, testimonials, reviews, prices, turnaround promises, statistics, years of experience, awards or software skills.
- Software and experience claims come only from `SHEFEER_BRIEF.md`. Adobe Audition is never shown.
- Project titles come only from `data/projects.json`. If a title looks like a placeholder or is not in the confirmed list in the brief, flag it; do not rename or invent.
- Do not imply a named brand, person or campaign commissioned a project unless Shefeer confirmed it.
- Never publish prices. Policies (revisions, turnaround, rush) only in wording Shefeer approved.
- Do not treat earlier AI reports as proof. A feature is "working" only if you ran it. Never describe a video or page you did not look at.
- If a fact is missing, ask.

## 4. Secrets and safety
- Never print, log, commit or paste values from `.env*` or any secret. Refer to variables by name; report only "set" or "missing".
- Never put the Cloudinary secret, GitHub token, admin password or session secret in client code.
- Work on the `redesign` branch. Commit after each finished prompt. Do not push to `main`, deploy or open PRs unless asked.
- Do not run `next build` while `next dev` is running.

## 5. Design rules
- Dark black background, white type, one orange accent (reuse the existing orange). Minimal, cinematic, editorial. The video work is the focus.
- Square or barely-rounded corners; hairline `white/10` rules; generous spacing.
- No new gradients, glow effects, glassmorphism, particle effects, WebGL or new 3D. (The existing ProfileCard tilt is approved and stays.)
- No new decorative elements. No notification behavior.

## 6. Motion rules
- Animation must be smooth and purposeful, never excessive. Reuse libraries already installed before adding any. Clean up listeners and timers.
- Animate only `transform`, `opacity`, `clip-path`.
- Respect `prefers-reduced-motion`: no autoplay video, poster images only. Cursor and hover effects only on `(hover: hover) and (pointer: fine)`.

## 7. Video performance rules (critical)
- Never download every video at once. Load near the viewport, pause when off-screen.
- Every `<video>`: `poster`, explicit aspect ratio (no layout shift), `playsInline`, `muted` for autoplay, `preload="none"` unless it is the visible hero clip.
- Use Cloudinary delivery transformations (`f_auto,q_auto`, width-limited) for hero, gallery and modal. Never serve original uploads.
- Respect `navigator.connection.saveData` and slow connections.
- Hero loads only its curated clips (current + next). The gallery must always show all projects regardless of hero rotation.
- The modal loads its source only when opened.
- The WhatsApp floating button must never overlap the speaker control.

## 8. Working rules
- One prompt = one area. Do not touch other areas.
- After each prompt, open the site, screenshot at **390, 768 and 1440 px**, look at them, and list what is wrong. Do not write "PASS" unless you looked. If you cannot view the page, say so.
- Report status in these categories when asked: verified working / implemented but untested / partial / not implemented / broken.
- Final report: 3-5 lines, plus the commit hash.
- List the manual steps a human must do. Do not claim production behavior you cannot test.
