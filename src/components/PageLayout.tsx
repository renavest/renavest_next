'use client';

import React, { ReactNode } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/src/features/home/components/Navbar';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
  backButtonHref?: string;
}

export default function PageLayout({
  title,
  children,
  className = '',
  backButtonHref,
}: PageLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pt-20 ${className}`}
    >
      <Navbar title={title} />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        {backButtonHref && (
          <Link
            href={backButtonHref}
            className='inline-flex items-center text-gray-600 hover:text-gray-800 mb-6'
          >
            <ChevronLeft className='h-5 w-5 mr-2' />
            <span>Back</span>
          </Link>
        )}
        {children}
      </main>
    </div>
  );
}
