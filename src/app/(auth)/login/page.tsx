'use client';

import LoginForm from '@/src/features/auth/components/LoginForm';

export default function LoginPage() {
  return (
    <div className='min-h-screen flex flex-col lg:flex-row'>
      {/* Welcome Section - Mobile */}
      <div className='lg:hidden bg-purple-50 py-8 px-4 text-center'>
        <h1 className='text-3xl font-bold text-gray-900 mb-4'>Welcome to Renavest</h1>
        <p className='text-lg text-gray-600 max-w-md mx-auto'>
          Transform your relationship with money through Financial Therapy
        </p>
      </div>

      {/* Left Column - Welcome Section - Desktop */}
      <div className='hidden lg:flex lg:w-1/2 bg-purple-50 items-center justify-center p-12'>
        <div className='text-center'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>Welcome to Renavest</h1>
          <p className='text-xl text-gray-600 max-w-md mx-auto'>
            Transform your relationship with money through Financial Therapy
          </p>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className='w-full lg:w-1/2 flex items-center justify-center px-4 py-12 lg:px-16'>
        <div className='w-full max-w-md'>
          <div className='mb-8 text-center'>
            <h2 className='text-3xl font-bold text-gray-900 mb-2'>Sign in to your account</h2>
            <p className='text-gray-600'>
              Welcome back! Please select your role and sign in to continue.
            </p>
          </div>

          <div className='space-y-6'>
            <h3 className='text-lg font-semibold text-gray-800 text-center'>I am a:</h3>
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
