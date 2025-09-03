import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import SideNav from '@/components/side-nav';

export const metadata: Metadata = {
  title: 'StudentHub',
  description:
    'A micro-service platform for students to showcase, exchange, and monetize their skills.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={cn('font-body antialiased')}>
        <div className="relative flex min-h-screen w-full">
          <SideNav />
          <main className="flex-1 md:ml-60 pb-20 md:pb-0">
            <div className="p-4 sm:p-6 lg:p-8">{children}</div>
          </main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
