import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { dataMode } from '@/lib/repo';
import './globals.css';

export const metadata: Metadata = {
  title: 'DreamSprout Studio',
  description: 'Editorial studio for DreamSprout bedtime stories',
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  const mode = dataMode();
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <header className="topbar">
            <Link href="/" className="brand">
              🌱 DreamSprout Studio
            </Link>
            <span className="mode" title="Data source">
              {mode === 'supabase' ? '● Supabase' : '○ Local seed (set SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY to sync)'}
            </span>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
