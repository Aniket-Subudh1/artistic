import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import ArtisticPreloader from '@/components/ArtisticPreloader';
import { ClientProviders } from '@/components/ClientProviders';
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://artistic.global'),
  title: {
    default: "Artistic - Your Creative Events & Talent Hub",
    template: "%s | Artistic"
  },
  description: "Discover and book talented artists, rent professional equipment, and create unforgettable events. Artistic connects you with the best creative professionals for your next event.",
  keywords: [
    "event management",
    "book artists",
    "rent equipment",
    "creative events",
    "talent booking",
    "event planning",
    "professional artists",
    "event equipment rental",
    "music events",
    "entertainment booking"
  ],
  authors: [{ name: "Artistic Team" }],
  creator: "Artistic",
  publisher: "Artistic",
  
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://artistic.global/",
    siteName: "Artistic",
    title: "Artistic - Your Creative Events & Talent Hub",
    description: "Discover and book talented artists, rent professional equipment, and create unforgettable events.",
    images: [
      {
        url: "/banner.png", 
        width: 1200,
        height: 630,
        alt: "Artistic - Creative Events & Talent Hub",
      }
    ],
  },

  twitter: {
    card: "summary_large_image",
    site: "@artistic", 
    creator: "@artistic",
    title: "Artistic - Your Creative Events & Talent Hub",
    description: "Discover and book talented artists, rent professional equipment, and create unforgettable events.",
    images: ["/banner.png"], 
  },

  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
      },
    ],
  },

  manifest: "/site.webmanifest",

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

  verification: {
    google: "your-google-verification-code", 
  },

  category: "Events & Entertainment",

  alternates: {
    canonical: "/", 
  },
};

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={direction}>
      <head>
        {/* Mobile browser theme colors - Set to white for clean appearance */}
        <meta name="theme-color" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#ffffff" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#ffffff" />
        
        {/* Mobile web app settings */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        
        {/* Additional mobile browser styling */}
        <meta name="msapplication-navbutton-color" content="#ffffff" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        
        {/* Viewport settings for better mobile experience */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "Artistic",
              "url": "https://artistic.global",
              "logo": "https://artistic.global/logo.png",
              "description": "Discover and book talented artists, rent professional equipment, and create unforgettable events.",
              "sameAs": [
                "https://facebook.com/artistic",
                "https://twitter.com/artistic",
                "https://instagram.com/artistic",
                "https://linkedin.com/company/artistic"
              ],
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+1-XXX-XXX-XXXX",
                "contactType": "Customer Service"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ArtisticPreloader />
        <NextIntlClientProvider messages={messages}>
          <ClientProviders>
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}