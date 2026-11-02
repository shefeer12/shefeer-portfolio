import type { Metadata, Viewport } from 'next';
import './globals.css';
import { siteConfig, SITE_URL } from '@/lib/site-config';
import JsonLd from '@/components/JsonLd';

const defaultTitle = `${siteConfig.brandName} | ${siteConfig.profession}`;
const defaultDescription =
  'Muhammed Shefeer K is a freelance video editor in Kochi, Kerala, crafting high-retention reels, YouTube edits, and cinematic promotional videos.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  title: {
    default: defaultTitle,
    template: `%s | ${siteConfig.brandName}`,
  },
  description: defaultDescription,
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
    'Subtitles and Captions',
  ],
  authors: [{ name: siteConfig.fullName, url: SITE_URL }],
  creator: siteConfig.fullName,
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: SITE_URL,
    title: defaultTitle,
    description: defaultDescription,
    siteName: `${siteConfig.brandName} Portfolio`,
    images: [
      {
        url: `${SITE_URL}/og.png`,
        width: 1200,
        height: 630,
        alt: `${siteConfig.fullName} — ${siteConfig.profession} Portfolio`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [`${SITE_URL}/og.png`],
    creator: '@reefehs_',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google:
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      'fXXJ2YwzLNlOZqFmQS3stiSk6fon1veyW4xWshgvNdE',
  },
};

export const viewport: Viewport = {
  themeColor: '#070709',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <JsonLd />
      </head>
      <body className="bg-[#070709] text-[#f5f3ef] antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
