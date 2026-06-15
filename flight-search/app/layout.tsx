import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/auth-context';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'FliteSmart — Find Flexible Flight Deals',
  description:
    'Search flights with flexible dates and see 12-month price history so you know when you\'re getting a real deal. No booking fees.',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://flitesmart.com'),
  openGraph: {
    title: 'FliteSmart — Find Flexible Flight Deals',
    description: 'Flexible date search, real price history, and deal ratings. Compare prices from 750+ airlines with no booking fees.',
    type: 'website',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'FliteSmart' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FliteSmart — Find Flexible Flight Deals',
    description: 'Flexible date search, real price history, and deal ratings. No booking fees.',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            if (localStorage.getItem('theme') === 'dark')
              document.documentElement.classList.add('dark');
          } catch(e) {}
        `}} />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'font-sans',
            },
          }}
        />
      </body>
    </html>
  );
}
