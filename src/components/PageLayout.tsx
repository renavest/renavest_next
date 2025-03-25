'use client';

import React, { ReactNode } from 'react';
import Navbar from '@/src/features/home/components/Navbar';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function PageLayout({ title, children, className = '' }: PageLayoutProps) {
  return (
    <div
      className={`min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pt-20 ${className}`}
    >
      <Navbar title={title} />
      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>{children}</main>
    </div>
  );
}
