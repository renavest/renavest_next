import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { Toaster } from 'sonner';

import './globals.css';
import { PostHogProvider } from '../components/PostHogProvider';

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
        <head>
          <script
            defer
            src='https://cloud.umami.is/script.js'
            data-website-id='aba27467-1b37-4c88-8c5a-614f67b16936'
          ></script>
        </head>
        <body className={`${figtreeFont.variable} antialiased bg-amber-50/30`}>
          <Toaster position='bottom-right' />
          <PostHogProvider>{children}</PostHogProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
