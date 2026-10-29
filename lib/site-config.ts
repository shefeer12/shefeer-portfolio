/**
 * Centralized site configuration for Shefeer's Video Editor Portfolio.
 * 
 * Update contact details, links, bio, and showreel configuration here.
 * Any change here will automatically propagate across the entire website.
 */

export interface SiteConfig {
  brandName: string;
  fullName: string;
  profession: string;
  experience: string;
  tagline: string;
  concept: string;
  bio: {
    headline: string;
    subheadline: string;
    paragraphs: string[];
    location: string;
    targetMarket: string;
    availability: string;
    isAvailable: boolean;
  };
  contact: {
    whatsappNumber: string;
    email: string;
    instagramUrl: string;
    linkedinUrl: string;
    youtubeUrl?: string;
  };
  commercialTerms: {
    pricing: string;
    currency: string;
    revisions: string;
    timelines: string;
    rushProjects: string;
    payment: string;
  };
  showreel: {
    title: string;
    year: string;
    duration: string;
    durationSeconds: number;
    aspectRatio: '9:16' | '16:9';
    videoUrl: string;
    cloudinaryPublicId?: string;
    videoType: 'html5' | 'cloudinary' | 'youtube' | 'vimeo' | 'demo';
    posterImage: string;
    caption: string;
  };
  tools: {
    name: string;
    role: string;
    level: 'Regular Use' | 'Basic Level' | 'Additional Tool';
  }[];
  skills: string[];
}

export const siteConfig: SiteConfig = {
  brandName: 'SHEFEER',
  fullName: 'Muhammed Shefeer K',
  profession: 'Freelance Video Editor',
  experience: '2+ years',
  tagline: 'Turning Raw Footage Into Stories That Connect.',
  concept: 'TURNING RAW FOOTAGE INTO STORIES THAT CONNECT.',
  bio: {
    headline: 'TURNING RAW FOOTAGE INTO STORIES THAT CONNECT.',
    subheadline: 'FREELANCE VIDEO EDITOR · 2+ YEARS EXPERIENCE · KOCHI, KERALA',
    paragraphs: [
      'I’m Muhammed Shefeer K, a freelance video editor based in Kochi, Kerala, India. I help creators and businesses turn raw footage into polished, engaging videos for digital platforms.',
      'From short-form reels to longer videos, I focus on strong pacing, thoughtful cuts, clean visuals, and storytelling that keeps the audience interested.',
      'Every project has its own story. My goal is to understand your vision and shape the footage into a video that feels clear, intentional, and true to your message.'
    ],
    location: 'Kochi, Kerala, India',
    targetMarket: 'Indian & International Clients',
    availability: 'OPEN FOR FREELANCE PROJECTS',
    isAvailable: true
  },
  contact: {
    whatsappNumber: '917907436032',
    email: 'mshefeerk@gmail.com',
    instagramUrl: 'https://www.instagram.com/reefehs_/',
    linkedinUrl: 'https://www.linkedin.com/in/muhammed-shefeer-k-570148409/'
  },
  commercialTerms: {
    pricing: 'Custom quotes tailored to each project scope',
    currency: 'INR (Indian Rupees)',
    revisions: '2 rounds of revisions included with every edit',
    timelines: 'Agreed individually after reviewing the project and footage',
    rushProjects: 'Rush turnaround accepted subject to availability',
    payment: 'Payment terms agreed individually with each client'
  },
  showreel: {
    title: 'VERTICAL SHOWREEL 2025',
    year: '2025',
    duration: '00:34',
    durationSeconds: 34.03,
    aspectRatio: '9:16',
    videoUrl: 'https://res.cloudinary.com/hvs5l0qz/video/upload/q_auto,f_auto/v1793207628/Muhammed%20Shefeer%20K%20%7C%20Video%20Editing%20Portfolio/01_Social_Media_Reels/Hanansha_home.mp4',
    videoType: 'cloudinary',
    posterImage: 'https://res.cloudinary.com/hvs5l0qz/video/upload/so_1,q_auto,f_auto/v1793207628/Muhammed%20Shefeer%20K%20%7C%20Video%20Editing%20Portfolio/01_Social_Media_Reels/Hanansha_home.jpg',
    caption: 'Selected vertical cut · Pacing, narrative flow & clean color balance'
  },
  tools: [
    { name: 'Adobe Premiere Pro', role: 'Primary NLE for narrative assembly, pacing & multi-track cutting', level: 'Regular Use' },
    { name: 'Adobe After Effects', role: 'Motion typography, animated lower-thirds & visual embellishments', level: 'Regular Use' },
    { name: 'CapCut', role: 'Quick-turnaround short-form edits, trending hooks & social audio sync', level: 'Regular Use' },
    { name: 'DaVinci Resolve', role: 'Foundational color correction & shot-to-shot tonal matching', level: 'Basic Level' },
    { name: 'Adobe Photoshop', role: 'Frame asset cutouts, custom titles & graphics preparation', level: 'Additional Tool' },
    { name: 'Canva', role: 'Quick social graphic elements, typography layouts & brand assets', level: 'Additional Tool' }
  ],
  skills: [
    'Short-form reels',
    'YouTube editing',
    'Podcast editing',
    'Color correction',
    'Subtitles and captions',
    'Cinematic edits',
    'Wedding/event highlights',
    'Promotional videos',
    'Long-form editing'
  ]
};

/**
 * Helper to generate a pre-formatted WhatsApp chat URL with contextual message.
 */
export function getWhatsAppUrl(customMessage?: string): string {
  const number = siteConfig.contact.whatsappNumber.replace(/[^0-9]/g, '');
  const message = customMessage || `Hi Shefeer, I saw your portfolio and would like to discuss a video editing project.`;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

/**
 * Helper to generate a pre-formatted Email mailto link with contextual subject and body.
 */
export function getMailtoUrl(subject?: string, body?: string): string {
  const defaultSubject = 'Video Editing Project Inquiry — Shefeer Portfolio';
  const defaultBody = `Hi Shefeer,\n\nI am reaching out regarding a video editing project.\n\nProject Type: \nTimeline: \nFootage details: \n\nLooking forward to hearing from you.`;
  return `mailto:${siteConfig.contact.email}?subject=${encodeURIComponent(subject || defaultSubject)}&body=${encodeURIComponent(body || defaultBody)}`;
}
