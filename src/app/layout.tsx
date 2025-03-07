import type { Metadata } from 'next';
import { Figtree } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const figtreeFont = Figtree({
  variable: '--font-figtree',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Renavest - Financial Wellness Therapy',
  description: 'Your safe space for financial wellness and therapy',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
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
        {children}
      </body>
    </html>
  );
}
