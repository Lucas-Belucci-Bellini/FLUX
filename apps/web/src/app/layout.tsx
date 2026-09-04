import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';

import { themeBootScript } from '@flux/ui';

import { Header } from '@/components/Header';
import { MobileNav, Sidebar } from '@/components/Navigation';
import { env } from '@/lib/env';

import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.FLUX_APP_URL),
  title: {
    default: 'FLUX',
    template: '%s · FLUX',
  },
  description:
    'Video, communities, music, live and a marketplace on one content graph. Nothing you watch is a dead end.',
  applicationName: 'FLUX',
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfbfd' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0e14' },
  ],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        {/*
          Applies the stored theme before the first paint. suppressHydrationWarning
          above is because this script legitimately mutates <html> before React
          takes over.
        */}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh bg-surface-0 text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-3 focus:py-2 focus:text-on-accent"
        >
          Pular para o conteúdo
        </a>

        <Sidebar />

        <div className="lg:pl-60">
          <Header />
          <main id="main" className="mx-auto max-w-[1400px] px-4 pb-24 pt-6 lg:px-8 lg:pb-12">
            {children}
          </main>
        </div>

        <MobileNav />
      </body>
    </html>
  );
}
