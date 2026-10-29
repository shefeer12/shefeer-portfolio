import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin Dashboard — Shefeer Video Portfolio',
  description: 'Private administration console for managing video portfolio projects.',
  robots: {
    index: false,
    follow: false
  }
};

export default function AdminLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#070709] text-[#f5f3ef]">
      {children}
    </div>
  );
}
