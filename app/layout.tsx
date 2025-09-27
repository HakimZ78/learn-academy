import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { DataProvider } from "@/contexts/DataContext";
import { LocalBusinessSchema } from "@/components/StructuredData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const poppins = Poppins({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: 'Learn Academy - Personalised Tutoring & Home Schooling in Birmingham',
    template: '%s | Learn Academy'
  },
  description: 'Expert 1-on-1 tutoring and home schooling in Birmingham. GCSE, A-Level, and Foundation programs. Breaking down subject barriers with interdisciplinary education for ages 8-18.',
  keywords: [
    'tutoring Birmingham',
    'home schooling Birmingham',
    'GCSE tutoring',
    'A-Level tutoring',
    'personalised education',
    'interdisciplinary learning',
    'science tutoring',
    'mathematics tutoring',
    'Key Stage 2 tutoring',
    'Key Stage 3 tutoring',
    'private tutor Birmingham',
    'one to one tutoring'
  ],
  authors: [{ name: 'Hakim Zaehid' }],
  creator: 'Learn Academy',
  publisher: 'Learn Academy',
  metadataBase: new URL('https://learn-academy.co.uk'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_GB',
    url: 'https://learn-academy.co.uk',
    siteName: 'Learn Academy',
    title: 'Learn Academy - Personalised Tutoring & Home Schooling',
    description: 'Expert 1-on-1 tutoring and home schooling in Birmingham. Interdisciplinary education for ages 8-18.',
    images: [
      {
        url: '/images/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Learn Academy - Personalised Education',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Learn Academy - Personalised Tutoring & Home Schooling',
    description: 'Expert 1-on-1 tutoring and home schooling in Birmingham.',
    images: ['/images/twitter-image.jpg'],
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <head>
        <LocalBusinessSchema />
      </head>
      <body className={inter.className}>
        <DataProvider>
          <Navigation />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </DataProvider>
      </body>
    </html>
  );
}
