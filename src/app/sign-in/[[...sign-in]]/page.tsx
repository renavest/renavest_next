import { SignIn } from '@clerk/nextjs';
import { Suspense } from 'react';

export default function Page() {
  return (
    <div className='flex min-h-screen items-center justify-center bg-amber-50/30 p-4'>
      <Suspense fallback={<div>Loading...</div>}>
        <div className='w-full max-w-md rounded-xl bg-white p-8 shadow-md'>
          <SignIn
            appearance={{
              elements: {
                card: 'shadow-none border-none',
                headerTitle: 'text-2xl font-bold text-gray-800',
                headerSubtitle: 'text-gray-600',
                socialButtonsBlockButton: 'w-full mb-4',
                formButtonPrimary: 'w-full bg-blue-500 hover:bg-blue-600 text-white',
              },
            }}
          />
        </div>
      </Suspense>
    </div>
  );
}
