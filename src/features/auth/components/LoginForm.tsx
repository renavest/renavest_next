'use client';

import { Lock, Mail } from 'lucide-react';

import { authSignal, updateAuthEmail, updateAuthPassword } from '../state/authSignals';

import GoogleSignInButton from './GoogleSignInButton';

interface LoginFormProps {
  onSubmit: (e: React.FormEvent) => void;
}

export default function LoginForm({ onSubmit }: LoginFormProps) {
  const auth = authSignal.value;

  return (
    <div className='w-full md:w-1/2 flex items-center justify-center p-8'>
      <div className='w-full max-w-md space-y-8'>
        <div className='text-center md:text-left'>
          <div className='font-medium text-xl text-[#952e8f] mb-1'>renavest</div>
          <h2 className='text-3xl font-bold text-gray-900'>Sign in as a client</h2>
        </div>

        <form onSubmit={onSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <div className='relative'>
              <input
                id='email'
                type='email'
                value={auth.email}
                onChange={(e) => updateAuthEmail(e.target.value)}
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
                value={auth.password}
                onChange={(e) => updateAuthPassword(e.target.value)}
                placeholder='Enter your password'
                className='pl-10 w-full h-11 rounded-lg border border-[#952e8f]/20 focus:border-[#952e8f] focus:ring-1 focus:ring-[#952e8f] bg-white'
                required
              />
              <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-[#952e8f] h-4 w-4' />
            </div>
          </div>

          {auth.error && <div className='text-red-500 text-sm'>{auth.error}</div>}

          <button
            type='submit'
            disabled={auth.isLoading}
            className='w-full bg-[#952e8f] hover:bg-[#952e8f]/90 text-white rounded-lg h-11 font-medium transition-colors disabled:opacity-50'
          >
            {auth.isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className='flex items-center justify-center'>
            <div className='border-t border-gray-300 w-1/3'></div>
            <div className='mx-4 text-sm text-gray-500'>Or</div>
            <div className='border-t border-gray-300 w-1/3'></div>
          </div>

          <GoogleSignInButton />
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
  );
}
