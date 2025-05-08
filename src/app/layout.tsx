import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';

import { PostHogProvider } from '@/src/features/posthog/PostHogProvider';

import { Providers as ParallaxProviders } from '../features/parallax/Providers';

const figtreeFont = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Renavest',
  description:
    'Connecting financial therapists to businesses that want to help their employees heal their relationship with money',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang='en'>
        <body className={`${figtreeFont.variable} antialiased bg-amber-50/30`}>
          <Toaster position='bottom-right' />
          <ParallaxProviders>
            <PostHogProvider>{children}</PostHogProvider>
          </ParallaxProviders>
        </body>
      </html>
    </ClerkProvider>
  );
}
