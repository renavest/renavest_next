'use client';

import { SignUp } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function Page() {
  const user = await currentUser();

  if (user) {
    redirect('/dashboard');
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-50'>
      <SignUp
        appearance={{
          elements: {
            card: 'shadow-lg border-none rounded-xl',
            headerTitle: 'text-2xl font-bold text-gray-800 mb-2',
            headerSubtitle: 'text-gray-500 mb-4',
            socialButtonsBlockButton: 'w-full mb-4 rounded-lg',
            formButtonPrimary: 'w-full bg-[#7c3aed] hover:bg-[#6d28d9] text-white rounded-lg',
            socialButtons: 'gap-2',
            socialButtonsIconButton: 'border border-gray-300 rounded-lg',
            formFieldInput:
              'border border-gray-300 rounded-lg focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30',
            formFieldLabel: 'text-gray-700 font-medium',
          },
        }}
      />
    </div>
  );
}
