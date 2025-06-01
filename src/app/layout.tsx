import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata, Viewport } from 'next';
import { Figtree } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

import { PostHogProvider } from '@/src/features/posthog/PostHogProvider';

import PageUtmHandler from '../features/utm/PageText';

const figtreeFont = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
  display: 'swap', // Optimize font loading
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#9071FF',
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://renavestapp.com'),
  title: {
    default: 'Renavest - Financial Therapy for Workplace Wellness',
    template: '%s | Renavest',
  },
  description:
    'Transform your workplace with financial therapy. Renavest connects businesses with certified financial therapists to reduce employee financial stress and boost productivity by up to 15%.',
  keywords: [
    'financial therapy',
    'financial therapist',
    'certified financial therapist',
    'financial therapy services',
    'money therapy',
    'financial counseling',
    'financial psychologist',
    'money mindset therapy',
    'financial stress therapy',
    'workplace financial therapy',
    'financial trauma therapy',
    'financial behavior therapy',
    'money relationship counseling',
    'financial wellness therapy',
    'financial therapy near me',
    'online financial therapy',
    'financial therapy training',
    'financial therapy certification',
    'workplace wellness',
    'employee benefits',
    'financial stress',
    'corporate wellness',
    'financial wellness programs',
    'employee financial health',
    'financial coaching',
    'mental health and money',
    'workplace productivity',
    'debt therapy',
    'financial anxiety help',
    'money management therapy',
    'financial planning therapy',
    'couples financial therapy',
  ],
  authors: [{ name: 'Renavest Team' }],
  creator: 'Renavest',
  publisher: 'Renavest',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Renavest - Financial Therapy Platform',
    title: 'Financial Therapy & Certified Financial Therapists | Renavest',
    description:
      'Transform your workplace with financial therapy. Reduce employee financial stress and boost productivity with certified financial therapists.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@renavest',
    creator: '@renavest',
    title: 'Renavest - Financial Therapy for Workplace Wellness',
    description:
      'Transform your workplace with financial therapy. Reduce employee financial stress and boost productivity.',
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
  alternates: {
    canonical: '/',
  },
  category: 'Business Services',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang='en' className='scroll-smooth'>
        <head>
          {/* Preconnect to external domains */}
          <link rel='preconnect' href='https://fonts.googleapis.com' />
          <link rel='preconnect' href='https://fonts.gstatic.com' crossOrigin='anonymous' />
          <link rel='preconnect' href='https://d2qcuj7ucxw61o.cloudfront.net' />

          {/* Structured Data for Organization */}
          <script
            type='application/ld+json'
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'Renavest',
                url: 'https://renavestapp.com',
                logo: 'https://renavestapp.com/logo.png',
                description:
                  'Renavest connects businesses with certified financial therapists to improve workplace wellness and reduce employee financial stress.',
                sameAs: ['https://linkedin.com/company/renavest', 'https://twitter.com/renavest'],
                contactPoint: {
                  '@type': 'ContactPoint',
                  contactType: 'customer service',
                  url: 'https://renavestapp.com/contact',
                },
                foundingDate: '2024',
                founders: [
                  {
                    '@type': 'Person',
                    name: 'Rameau Stan',
                  },
                ],
                serviceArea: {
                  '@type': 'Country',
                  name: 'United States',
                },
                hasOfferCatalog: {
                  '@type': 'OfferCatalog',
                  name: 'Financial Therapy Services',
                  itemListElement: [
                    {
                      '@type': 'Offer',
                      itemOffered: {
                        '@type': 'Service',
                        name: 'Workplace Financial Therapy',
                        description:
                          'Comprehensive financial therapy programs for employees to improve workplace wellness and productivity.',
                      },
                    },
                  ],
                },
              }),
            }}
          />
        </head>
        <body className={`${figtreeFont.variable} antialiased bg-amber-50/30`}>
          <PageUtmHandler>
            <Toaster position='bottom-right' />
            <PostHogProvider>{children}</PostHogProvider>
          </PageUtmHandler>
        </body>
      </html>
    </ClerkProvider>
  );
}
