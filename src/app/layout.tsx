import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { OrgProvider } from '@/context/org-context';
import { AppLayout } from '@/components/layout/app-layout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Local SEO Operating System | Multi-Tenant Local Search SaaS',
  description:
    'A SaaS platform combining rank tracking, Google Business Profile management, health checks, and AI recommendations into one product.',
  icons: {
    icon: '/icon.png',
    shortcut: '/favicon.ico',
    apple: '/icon.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <OrgProvider>
            <AppLayout>{children}</AppLayout>
          </OrgProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
