'use client';
import { useStore } from '@nanostores/react';
import { AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';

import { $auth } from '../stores';
import { setUserVerified, checkUserVerified } from '../utils/auth';
import { emailSignal } from '../utils/emailState';
import { loginSchema, validateCompanyEmail, validateCode } from '../utils/validation';

import VerificationInput from './VerificationInput';

declare global {
  interface Window {
    umami: {
      trackEvent: (event: string, data: { email: string }) => void;
    };
  }
}

export default function VerificationForm() {
  const auth = useStore($auth);
  const router = useRouter();

  useEffect(() => {
    if (checkUserVerified()) {
      router.push('/');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Verification submitted', { email: auth.email, code: auth.code });

    try {
      loginSchema.parse(auth);
      console.log('Zod validation passed');

      if (!validateCompanyEmail(auth.email)) {
        toast.error('Please use your company email address', {
          description: 'Need access? Schedule a demo with our team',
        });
        return;
      }

      if (!validateCode(auth.code)) {
        toast.error('Please enter the correct verification code', {
          description: 'Need access? Schedule a demo with our team',
        });
        return;
      }

      setUserVerified(auth.email);

      if (typeof window !== 'undefined' && window.umami?.trackEvent) {
        window.umami.trackEvent('VerificationSubmitted', { email: emailSignal.value });
      }

      console.log('Verification successful');
      router.push('/');
    } catch (err) {
      console.error('Validation error:', err);
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    }
  };

  return (
    <div className='min-h-screen flex items-center justify-center bg-background'>
      <div className='w-full max-w-md space-y-8 p-8 shadow-lg'>
        <div className='text-center'>
          <h1 className='text-3xl font-bold tracking-tight'>
            Verify your <span className='text-[#875cf3]'>Renavest</span> account
          </h1>
          <p className='mt-2 text-muted-foreground'>Enter your details to verify your account</p>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <VerificationInput />

          {auth.error && (
            <div className='p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2'>
              <AlertCircle className='w-5 h-5' />
              <span>{auth.error}</span>
            </div>
          )}

          <button
            type='submit'
            className='w-full bg-primary text-primary-foreground h-11 px-4 rounded-lg font-medium'
            disabled={auth.isLoading}
          >
            {auth.isLoading ? (
              <span className='flex items-center justify-center gap-2'>
                <span className='w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin' />
                Verifying...
              </span>
            ) : (
              'Verify Account'
            )}
          </button>
        </form>

        <p className='text-center text-sm text-muted-foreground'>
          New to Renavest?{' '}
          <a href='/demo' className='font-medium text-primary hover:underline'>
            Schedule a demo
          </a>
        </p>
      </div>
    </div>
  );
}
