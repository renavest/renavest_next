'use client';
import { Award } from 'lucide-react';

export default function DashboardHeader() {
  return (
    <header className='bg-[#952e8f] text-white shadow-lg'>
      <div className='container mx-auto px-4 py-4 flex justify-between items-center'>
        <div className='flex items-center space-x-2'>
          <Award className='h-8 w-8 text-white' />
          <h1 className='text-xl font-semibold'>Renavest Dashboard</h1>
        </div>
      </div>
    </header>
  );
}
