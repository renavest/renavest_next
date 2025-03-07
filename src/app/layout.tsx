import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const outfitFont = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'FinWell - Financial Wellness Therapy',
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
      <body className={`${outfitFont.variable} antialiased bg-amber-50/30`}>
        <Toaster position='bottom-right' />
        {children}
      </body>
    </html>
  );
}
