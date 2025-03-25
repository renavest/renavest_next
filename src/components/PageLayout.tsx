'use client';

import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import React, { ReactNode } from 'react';

import Navbar from '@/src/features/home/components/Navbar';
import { COLORS } from '@/src/styles/colors';

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
    <div className={`min-h-screen ${COLORS.WARM_WHITE.bg} font-sans ${className}`}>
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
