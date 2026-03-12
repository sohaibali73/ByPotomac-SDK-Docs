import type { Metadata, Viewport } from 'next';
import { Rajdhani, Quicksand, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const rajdhani = Rajdhani({
  subsets: ['latin'],
  weight: ['300', '500', '700'],
  variable: '--font-rajdhani',
});

const quicksand = Quicksand({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-quicksand',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: 'ByPotomac SDK API Documentation',
  description: 'Complete API documentation for the ByPotomac SDK',
  keywords: ['API', 'Documentation', 'SDK', 'Potomac', 'Financial', 'AI'],
  authors: [{ name: 'Sohaib Ali' }],
  creator: 'Sohaib Ali',
  publisher: 'Potomac Fund Management',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://api.bypotomac.com/docs',
    title: 'ByPotomac SDK API Documentation',
    description: 'Complete API documentation for the ByPotomac SDK',
    siteName: 'ByPotomac SDK',
    images: [
      {
        url: '/api-docs-og-image.png',
        width: 1200,
        height: 630,
        alt: 'ByPotomac SDK API Documentation',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ByPotomac SDK API Documentation',
    description: 'Complete API documentation for the ByPotomac SDK',
    creator: '@potomac',
    images: ['/api-docs-og-image.png'],
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
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${rajdhani.variable} ${quicksand.variable} ${jetbrainsMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
