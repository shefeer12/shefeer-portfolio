import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteConfig } from '@/lib/site-config';

export const metadata: Metadata = {
  title: `${siteConfig.brandName} — Muhammed Shefeer K | Freelance Video Editor`,
  description: `${siteConfig.fullName} is a freelance video editor with 2+ years of experience based in Kochi, Kerala, India. Specializing in short-form reels, YouTube editing, podcasts, cinematic edits, and promotional videos.`,
  keywords: [
    'Muhammed Shefeer K',
    'Freelance Video Editor',
    'Video Editor Kochi',
    'Video Editor Kerala',
    'Instagram Reels Editor',
    'YouTube Shorts Editor',
    'Podcast Video Editor',
    'Adobe Premiere Pro',
    'Adobe After Effects',
    'CapCut Editor',
    'Color Correction',
    'Subtitles and Captions'
  ],
  authors: [{ name: siteConfig.fullName }],
  creator: siteConfig.fullName,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    title: `${siteConfig.brandName} — Muhammed Shefeer K | Freelance Video Editor`,
    description: 'Turning Raw Footage Into Stories That Connect. Freelance Video Editor based in Kochi, Kerala.',
    siteName: `${siteConfig.brandName} Portfolio`,
    images: [
      {
        url: siteConfig.showreel.posterImage,
        width: 1200,
        height: 630,
        alt: `${siteConfig.brandName} Video Editor Portfolio`
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.brandName} — Muhammed Shefeer K | Freelance Video Editor`,
    description: 'Turning Raw Footage Into Stories That Connect. Freelance Video Editor based in Kochi, Kerala.',
    images: [siteConfig.showreel.posterImage]
  },
  robots: {
    index: true,
    follow: true
  }
};

export const viewport: Viewport = {
  themeColor: '#070709',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: siteConfig.fullName,
    alternateName: siteConfig.brandName,
    jobTitle: siteConfig.profession,
    description: siteConfig.tagline,
    knowsAbout: siteConfig.skills
  };

  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="bg-[#070709] text-[#f5f3ef] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
