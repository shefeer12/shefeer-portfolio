# SHEFEER — Premium Vertical-First Video Editor Portfolio

A cinematic, award-winning portfolio website for independent video editor **Muhammed Shefeer**, built with **Next.js App Router**, **TypeScript**, and **Tailwind CSS**.

Art-directed specifically around **9:16 portrait video** for short-form social content (Instagram Reels, YouTube Shorts, TikTok), high-retention creator cuts, and commercial brand edits.

---

## ⚡ Key Architectural Features

- **Vertical-First 9:16 Architecture**: All project cards, hero showcase, and showreel frames maintain true 9:16 portrait proportions without cropping, awkward letterboxing, or distortion.
- **Universal Interactive Video Player (`components/VideoPlayer.tsx`)**:
  - Full support for local MP4/WebM files, YouTube Shorts embeds, and Vimeo embeds.
  - High-fidelity cinematic simulation mode with real-time timecode (`00:00:14:18`), audio equalizer wave motion, scrub bar, mute/unmute, and viewfinder HUD when real video files are pending.
- **In-Depth Case Study Modal (`components/ProjectModal.tsx`)**:
  - Accessible dialog (`aria-modal`, body scroll lock, Escape key, focus trap).
  - Detailed breakdown of each project: Objective, Hook Strategy, Pacing & Rhythm, Sound Design, DaVinci Resolve Color Grade, and Software Stack.
  - Previous / Next project keyboard navigation.
  - Contextual "Discuss a Similar Edit" button with pre-filled WhatsApp brief.
- **Centralized Client Configuration (`lib/site-config.ts`)**:
  - Update Shefeer's WhatsApp phone number, email, social links, bio, and showreel settings in **one single place**.
- **Interactive Project Inquiry Builder (`components/InquiryForm.tsx`)**:
  - Allows potential clients to configure video type, volume, and footage status.
  - Instantly constructs a clean, formatted brief with 1-click delivery to WhatsApp or Email (zero fake form spinners).
- **SEO & Social Optimization**:
  - Full OpenGraph, Twitter Cards, canonical URL, and Schema.org JSON-LD structured data in `app/layout.tsx`.
- **Accessibility & Motion Design**:
  - Keyboard-navigable controls, ARIA dialog roles, high-contrast outlines, and full `prefers-reduced-motion` compliance.

---

## 🚀 Quick Start

### 1. Requirements
- Node.js 18.18+ or 20.9+
- npm or pnpm or yarn

### 2. Install & Run Dev Server
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build
```bash
npm run build
npm run start
```

---

## 🎬 How Shefeer Configures Real Client Assets

### Step 1: Update Contact Information
Open [`lib/site-config.ts`](file:///d:/project/shefeer-portfolio/lib/site-config.ts) where Shefeer's details are configured:
```ts
contact: {
  whatsappNumber: '917907436032',
  email: 'mshefeerk@gmail.com',
  instagramUrl: 'https://www.instagram.com/reefehs_/',
  linkedinUrl: 'https://www.linkedin.com/in/muhammed-shefeer-k-570148409/'
}
```

### Step 2: Add Real Videos via Cloudinary (Recommended) or Local Files

#### Option A: Cloudinary Video Hosting (Best for Performance & Fast Loading)
1. Log in to your Cloudinary Console: [https://console.cloudinary.com/](https://console.cloudinary.com/) (Cloud Name: `hvs5l0qz`).
2. Go to **Media Library** and create a folder named `shefeer-portfolio` (or upload directly).
3. Drag and drop your vertical 9:16 `.mp4` video cuts.
4. Click on the uploaded video and copy its **Secure Delivery URL** (or **Public ID**):
   - Example URL: `https://res.cloudinary.com/hvs5l0qz/video/upload/q_auto,f_auto/shefeer-portfolio/urban-kinetic.mp4`
   - Example Public ID: `shefeer-portfolio/urban-kinetic`
5. Open [`lib/projects.ts`](file:///d:/project/shefeer-portfolio/lib/projects.ts) and paste the URL or Public ID:
   ```ts
   {
     id: 'urban-kinetic-reel',
     // Option 1: Full URL
     videoUrl: 'https://res.cloudinary.com/hvs5l0qz/video/upload/q_auto,f_auto/shefeer-portfolio/urban-kinetic.mp4',
     // OR Option 2: Public ID with videoType 'cloudinary'
     // cloudinaryPublicId: 'shefeer-portfolio/urban-kinetic',
     // videoType: 'cloudinary',
     isDemoPlaceholder: false,
     ...
   }
   ```
6. **Automatic Thumbnail**: Cloudinary will automatically generate the poster thumbnail from the video frame!

#### Option B: Local Video Files or YouTube
- **Local Files**: Place your vertical `.mp4` files into `/public/videos/` and set `videoUrl: '/videos/showreel.mp4'`.
- **YouTube/Vimeo**: Set `videoUrl: 'https://www.youtube.com/watch?v=...'` and `videoType: 'youtube'`.

---

## 📁 Project Structure

```
shefeer-portfolio/
├── app/
│   ├── globals.css          # Filmic dark theme, custom scrollbars, scanlines, animations
│   ├── layout.tsx           # SEO, OpenGraph metadata, JSON-LD Schema
│   └── page.tsx             # Composed portfolio with modal state management
├── components/
│   ├── Navbar.tsx           # Sticky editorial navigation, wordmark, mobile drawer
│   ├── Hero.tsx             # Asymmetric hero, oversized typography, 9:16 showcase
│   ├── WorkGallery.tsx      # Multi-column portrait 9:16 grid with category filters
│   ├── ProjectCard.tsx      # Individual 9:16 card with timecode, duration, hover effects
│   ├── ProjectModal.tsx     # Fullscreen case study modal with video playback & navigation
│   ├── VideoPlayer.tsx      # Universal video player (HTML5 / Embed / Filmic simulation)
│   ├── ShowreelSection.tsx  # Dominant 9:16 showreel showcase with technical specs
│   ├── ServicesSection.tsx  # High-value service offerings (Shorts, Brand, Color & Sound)
│   ├── AboutSection.tsx     # Muhammed Shefeer bio, philosophy, software stack & skills
│   ├── ProcessSection.tsx   # 4-stage transparent client workflow
│   ├── ContactSection.tsx   # Direct WhatsApp, email, social links
│   ├── InquiryForm.tsx      # Interactive project brief builder (WhatsApp/Mail generator)
│   └── Footer.tsx           # Brand stamp, live year, anchor navigation
├── lib/
│   ├── site-config.ts       # Centralized client configuration & WhatsApp helper
│   └── projects.ts          # Strongly typed 9:16 project data & case studies
├── tailwind.config.ts       # Custom palette, font stacks, and motion keyframes
└── package.json
```

---

## 🚢 Deploying to Vercel

1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import this repository and click **Deploy**.
4. In `app/layout.tsx`, change `https://shefeer.design` to your live production custom domain.
