'use client';

import { CheckCircle, Mail, ArrowRight, Heart, DollarSign } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting waitlist:', error);
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4'>
        <div className='max-w-sm w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
          <div className='p-8 text-center'>
            <div className='mx-auto w-16 h-16 bg-gradient-to-br from-purple-100 to-green-100 rounded-full flex items-center justify-center mb-6'>
              <CheckCircle className='w-10 h-10 text-[#9071FF]' />
            </div>
            <h2 className='text-xl font-bold text-gray-900 mb-3'>You're on the list!</h2>
            <p className='text-gray-600 mb-6 text-sm'>We'll notify you when we launch.</p>
            <Link
              href='/'
              className='inline-flex items-center justify-center px-6 py-3 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition-all duration-300 font-medium text-sm'
            >
              Back to Home
              <ArrowRight className='w-4 h-4 ml-2' />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50'>
      {/* Header */}
      <header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-3'>
        <div className='max-w-4xl mx-auto flex items-center justify-between'>
          <Link href='/' className='flex items-center space-x-2'>
            <div className='relative w-8 h-8'>
              <Image
                src='/renavestlogo.png'
                alt='Renavest Logo'
                width={32}
                height={32}
                className='object-contain'
                priority
              />
            </div>
            <h1 className='text-lg font-semibold text-gray-800 hover:text-[#9071FF] transition-colors'>
              Renavest
            </h1>
          </Link>
          <Link
            href='/'
            className='text-gray-600 hover:text-[#9071FF] transition-colors font-medium text-sm'
          >
            Back
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='pt-20 pb-16 px-4'>
        <div className='max-w-lg mx-auto text-center'>
          {/* Hero Section */}
          <div className='mb-12'>
            <div className='inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-3 py-1 mb-6'>
              <span className='text-xs font-medium text-[#9071FF]'>Coming Soon</span>
            </div>

            <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight'>
              Financial Therapy
              <span className='block text-2xl md:text-3xl bg-gradient-to-r from-[#9071FF] to-pink-500 bg-clip-text text-transparent'>
                Actually Talks About Money
              </span>
            </h1>

            <p className='text-base text-gray-600 mb-8 leading-relaxed max-w-md mx-auto'>
              Regular therapy avoids money talk. Financial therapy makes it the focus.
              <span className='block mt-2 font-medium text-gray-800'>
                Heal your relationship with money.
              </span>
            </p>

            {/* Simple Visual */}
            <div className='grid grid-cols-2 gap-4 mb-8 max-w-xs mx-auto'>
              <div className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100'>
                <Heart className='w-8 h-8 text-gray-400 mx-auto mb-2' />
                <p className='text-xs text-gray-500 font-medium'>Regular Therapy</p>
                <p className='text-xs text-gray-400'>Avoids money topics</p>
              </div>
              <div className='bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 shadow-sm border border-purple-100'>
                <div className='flex items-center justify-center mb-2'>
                  <Heart className='w-6 h-6 text-[#9071FF]' />
                  <DollarSign className='w-6 h-6 text-pink-500 -ml-1' />
                </div>
                <p className='text-xs text-[#9071FF] font-medium'>Financial Therapy</p>
                <p className='text-xs text-gray-600'>Focuses on money</p>
              </div>
            </div>
          </div>

          {/* Waitlist Form */}
          <div className='bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
            <div className='bg-gradient-to-r from-[#9071FF] to-pink-500 p-6 text-center'>
              <Mail className='w-12 h-12 text-white mx-auto mb-3' />
              <h2 className='text-xl font-bold text-white mb-1'>Join the Waitlist</h2>
              <p className='text-purple-100 text-sm'>Be first to heal your money relationship</p>
            </div>

            <div className='p-6'>
              <form onSubmit={handleSubmit} className='space-y-4'>
                <div>
                  <input
                    type='email'
                    id='email'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder='Enter your email'
                    className='w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-[#9071FF] focus:ring-2 focus:ring-[#9071FF]/20 transition-all duration-300'
                    required
                    disabled={isSubmitting}
                  />
                </div>

                {error && (
                  <div className='p-3 bg-red-50 border border-red-200 rounded-lg'>
                    <p className='text-sm text-red-600'>{error}</p>
                  </div>
                )}

                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='w-full py-3 px-6 bg-gradient-to-r from-[#9071FF] to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-[#9071FF]/90 hover:to-pink-500/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5'
                >
                  {isSubmitting ? (
                    <span className='flex items-center justify-center'>
                      <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                      Joining...
                    </span>
                  ) : (
                    'Join Waitlist'
                  )}
                </button>
              </form>

              <div className='mt-4 pt-4 border-t border-gray-100'>
                <div className='flex items-center justify-center space-x-4 text-xs text-gray-500'>
                  <div className='flex items-center'>
                    <CheckCircle className='w-3 h-3 text-green-500 mr-1' />
                    No spam
                  </div>
                  <div className='flex items-center'>
                    <CheckCircle className='w-3 h-3 text-green-500 mr-1' />
                    Early access
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='text-center py-6'>
        <p className='text-gray-400 text-xs'>
          © {new Date().getFullYear()} Renavest. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
