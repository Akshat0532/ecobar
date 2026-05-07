import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { Providers } from './providers';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: {
    default: 'EcoTrace | Personal Carbon Footprint Tracker',
    template: '%s | EcoTrace',
  },
  description: 'Calculate, track, and understand your personal carbon emissions. Private, free, and science-informed.',
  keywords: ['carbon footprint', 'climate change', 'sustainability', 'CO2 calculator', 'green initiative', 'India'],
  openGraph: {
    title: 'EcoTrace Carbon Tracker',
    description: 'See how your lifestyle impacts the planet.',
    url: 'https://ecotrace.vercel.app',
    siteName: 'EcoTrace',
    images: [
      {
        url: 'https://ecotrace.vercel.app/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Fonts — Inter (headings/body) + Cormorant Garamond (accent serif) */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#FAF9F6] dark:bg-[#0F1F0F] text-[#1A3B1A] dark:text-[#E8F0E8] antialiased" suppressHydrationWarning>
        <Providers>
          <Header />
          <div className="min-h-screen relative z-10">{children}</div>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: '#FFFFFF',
                color: '#1A3B1A',
                border: '1px solid #D4E4CC',
                borderRadius: '8px',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
