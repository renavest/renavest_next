'use client';

import { Lock, Mail } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { cn } from '@/src/lib/utils';
import { COLORS } from '@/src/styles/colors';

import { authState, updateAuthEmail, updateAuthPassword } from '../state/authState';

const InputField = ({
  id,
  type,
  value,
  onChange,
  placeholder,
  icon: Icon,
  rightElement,
}: {
  id: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: typeof Mail | typeof Lock;
  rightElement?: React.ReactNode;
}) => (
  <div className='space-y-2'>
    <div className='flex items-center justify-between'>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
        {id.charAt(0).toUpperCase() + id.slice(1)}
      </label>
      {rightElement}
    </div>
    <div className='relative'>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'pl-10 w-full h-11 rounded-lg border bg-white',
          COLORS.WARM_PURPLE[20],
          COLORS.WARM_PURPLE.focus,
        )}
        required
      />
      <Icon
        className={cn(
          'absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4',
          COLORS.WARM_PURPLE.DEFAULT,
        )}
      />
    </div>
  </div>
);

export default function LoginForm() {
  const auth = authState.value;
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // For demo purposes, accept any email/password combination
    if (auth.email && auth.password) {
      router.push('/dashboard');
    } else {
      setError('Please enter both email and password');
    }
  };

  return (
    <div className='w-full flex items-center justify-center px-4 py-4'>
      <div className='w-full max-w-md space-y-2'>
        <div className='text-center mb-2'>
          <div className={cn('font-medium text-xl mb-1', COLORS.WARM_PURPLE.DEFAULT)}>renavest</div>
          <h2 className='text-3xl font-bold text-gray-900 mb-1'>Sign in as a client</h2>
        </div>

        <form onSubmit={handleSubmit} className='space-y-3'>
          <InputField
            id='email'
            type='email'
            value={auth.email}
            onChange={updateAuthEmail}
            placeholder='Enter your email'
            icon={Mail}
          />

          <InputField
            id='password'
            type='password'
            value={auth.password}
            onChange={updateAuthPassword}
            placeholder='Enter your password'
            icon={Lock}
            rightElement={
              <Link href='#' className={cn('text-sm hover:opacity-80', COLORS.WARM_PURPLE.DEFAULT)}>
                Forgot password?
              </Link>
            }
          />

          {(error || auth.error) && (
            <div className='text-red-500 text-sm text-center'>{error || auth.error}</div>
          )}

          <button
            type='submit'
            disabled={auth.isLoading}
            className={cn(
              'w-full text-white rounded-lg h-11 font-medium transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50',
              COLORS.WARM_PURPLE.bg,
            )}
          >
            {auth.isLoading ? 'Signing in...' : 'Sign in'}
          </button>

          <div className='text-center mt-2'>
            <p className='text-sm text-gray-600'>
              Don't have an account?{' '}
              <Link
                href='/sign-up'
                className={cn('font-medium hover:opacity-80', COLORS.WARM_PURPLE.DEFAULT)}
              >
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
