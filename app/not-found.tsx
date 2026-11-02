import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The requested page could not be found on Muhammed Shefeer K video editing portfolio.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#070709] text-[#f5f3ef] flex items-center justify-center p-6 selection:bg-accent selection:text-black">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-xs font-mono uppercase tracking-widest text-accent">
          Error 404
        </p>
        <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white uppercase font-sans">
          Page Not Found
        </h1>
        <p className="text-sm text-white/60 font-light leading-relaxed">
          The frame you are looking for does not exist or has been moved to another location.
        </p>
        <div className="pt-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-accent text-black font-semibold text-xs font-mono uppercase tracking-wider hover:bg-accent-hover transition shadow-lg shadow-accent/20"
          >
            Return to Portfolio
          </Link>
        </div>
      </div>
    </main>
  );
}
