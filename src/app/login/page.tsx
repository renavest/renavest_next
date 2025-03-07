'use client';

import { Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Changed from 'next/navigation' to 'next/router'
import { useState } from 'react';

import { setUserVerified } from '@/src/features/auth/utils/auth';
// import { loginSchema } from '@/src/features/auth/utils/validation';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
    setUserVerified(email);
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-[#faf9f6]'>
      {/* Left side with welcome message */}
      <div className='w-full md:w-1/2 flex items-center justify-center p-8 relative overflow-hidden'>
        <div className='absolute inset-0'>
          <div className='absolute inset-0 bg-[#faf9f6] z-0'>
            {/* Decorative lines */}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`h-${i}`}
                className='absolute bg-[#952e8f]/10'
                style={{
                  height: '1px',
                  width: '100%',
                  top: `${i * 12.5}%`,
                  transform: 'rotate(-5deg)',
                  transformOrigin: 'left',
                }}
              />
            ))}
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`v-${i}`}
                className='absolute bg-[#952e8f]/10'
                style={{
                  width: '1px',
                  height: '100%',
                  left: `${i * 12.5}%`,
                  transform: 'rotate(5deg)',
                  transformOrigin: 'top',
                }}
              />
            ))}
          </div>
        </div>

        <div className='relative z-10 w-full max-w-md bg-white p-8 rounded-2xl shadow-lg border-2 border-[#952e8f]/20'>
          <h1 className='text-4xl md:text-5xl font-bold text-gray-900 leading-tight'>
            Welcome to
            <br />
            Renavest!
          </h1>

          <p className='mt-4 text-gray-600'>
            Transform your relationship with money through Financial Therapy
          </p>
        </div>
      </div>

      {/* Right side with login form */}
      <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
        <div className='w-full max-w-md space-y-8'>
          <div className='text-center md:text-left'>
            <div className='font-medium text-xl text-[#952e8f] mb-1'>renavest</div>
            <h2 className='text-3xl font-bold text-gray-900'>Sign in as a client</h2>
          </div>

          <form onSubmit={handleSubmit} className='space-y-6'>
            <div className='space-y-2'>
              <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
                Email
              </label>
              <div className='relative'>
                <input
                  id='email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder='Enter your email'
                  className='pl-10 w-full h-11 rounded-lg border border-[#952e8f]/20 focus:border-[#952e8f] focus:ring-1 focus:ring-[#952e8f] bg-white'
                  required
                />
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#952e8f] h-4 w-4' />
              </div>
            </div>

            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
                  Password
                </label>
                <a href='#' className='text-sm text-[#952e8f] hover:text-[#952e8f]/80'>
                  Forgot password?
                </a>
              </div>
              <div className='relative'>
                <input
                  id='password'
                  type='password'
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder='Enter your password'
                  className='pl-10 w-full h-11 rounded-lg border border-[#952e8f]/20 focus:border-[#952e8f] focus:ring-1 focus:ring-[#952e8f] bg-white'
                  required
                />
                <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#952e8f] h-4 w-4' />
              </div>
            </div>

            <button
              type='submit'
              className='w-full bg-[#952e8f] hover:bg-[#952e8f]/90 text-white rounded-lg h-11 font-medium transition-colors'
            >
              Sign in
            </button>

            <div className='flex items-center justify-center'>
              <div className='border-t border-gray-300 w-1/3'></div>
              <div className='mx-4 text-sm text-gray-500'>Or</div>
              <div className='border-t border-gray-300 w-1/3'></div>
            </div>

            <button
              type='button'
              className='w-full border-2 border-[#952e8f]/20 text-gray-900 rounded-lg h-11 font-medium hover:bg-[#952e8f]/5 transition-colors flex items-center justify-center'
            >
              <svg className='w-5 h-5 mr-2' viewBox='0 0 24 24'>
                <path
                  d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                  fill='#4285F4'
                />
                <path
                  d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                  fill='#34A853'
                />
                <path
                  d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                  fill='#FBBC05'
                />
                <path
                  d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                  fill='#EA4335'
                />
                <path d='M1 1h22v22H1z' fill='none' />
              </svg>
              Sign in with Google
            </button>
          </form>

          <div className='text-center'>
            <p className='text-sm text-gray-600'>
              Don't have an account?{' '}
              <a href='#' className='text-[#952e8f] hover:text-[#952e8f]/80 font-medium'>
                Sign up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
