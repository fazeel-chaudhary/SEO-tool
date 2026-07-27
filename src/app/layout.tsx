import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/providers/theme-provider';
import { OrgProvider } from '@/context/org-context';
import { AppLayout } from '@/components/layout/app-layout';

export const metadata: Metadata = {
  title: 'Local SEO Operating System | Multi-Tenant Local Search SaaS',
  description:
    'A SaaS platform combining rank tracking, Google Business Profile management, health checks, and AI recommendations into one product.',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.png', type: 'image/png' },
    ],
    shortcut: '/icon.png',
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
      <body className="font-sans antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <OrgProvider>
            <AppLayout>{children}</AppLayout>
          </OrgProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
