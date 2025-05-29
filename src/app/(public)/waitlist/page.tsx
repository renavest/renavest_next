'use client';

import { useState } from 'react';
import { CheckCircle, Mail, Users, TrendingUp, Heart, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import { COLORS } from '@/src/styles/colors';

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

  const features = [
    {
      icon: <Heart className='w-8 h-8' />,
      title: 'Emotional Wellness',
      description: 'Connect your financial health with emotional wellbeing through expert guidance',
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      icon: <TrendingUp className='w-8 h-8' />,
      title: 'Financial Growth',
      description:
        'Build healthy money habits and achieve your financial goals with professional support',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      icon: <Users className='w-8 h-8' />,
      title: 'Expert Therapists',
      description: 'Work with licensed financial therapists who understand both money and emotions',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
  ];

  if (isSubmitted) {
    return (
      <div className='min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center p-4'>
        <div className='max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
          <div className='p-8 text-center'>
            <div className='mx-auto w-20 h-20 bg-gradient-to-br from-purple-100 to-green-100 rounded-full flex items-center justify-center mb-6'>
              <CheckCircle className='w-12 h-12 text-[#9071FF]' />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-4'>You're on the list!</h2>
            <p className='text-gray-600 mb-6'>
              Thank you for joining our waitlist. We'll notify you as soon as we launch.
            </p>
            <Link
              href='/'
              className='inline-flex items-center justify-center px-6 py-3 bg-[#9071FF] text-white rounded-full hover:bg-[#9071FF]/90 transition-all duration-300 font-medium'
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
      <header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-6 py-4'>
        <div className='max-w-7xl mx-auto flex items-center justify-between'>
          <Link href='/' className='flex items-center space-x-3'>
            <div className='relative w-10 h-10'>
              <Image
                src='/renavestlogo.png'
                alt='Renavest Logo'
                width={40}
                height={40}
                className='object-contain'
                priority
              />
            </div>
            <h1 className='text-xl font-semibold text-gray-800 hover:text-[#9071FF] transition-colors'>
              Renavest
            </h1>
          </Link>
          <Link
            href='/'
            className='text-gray-600 hover:text-[#9071FF] transition-colors font-medium'
          >
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className='pt-24 pb-16 px-4'>
        <div className='max-w-4xl mx-auto'>
          {/* Hero Section */}
          <div className='text-center mb-16'>
            <div className='inline-flex items-center bg-gradient-to-r from-purple-100 to-pink-100 rounded-full px-4 py-2 mb-6'>
              <span className='text-sm font-medium text-[#9071FF]'>Coming Soon</span>
            </div>
            <h1 className='text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight'>
              Join the Financial
              <span className='block bg-gradient-to-r from-[#9071FF] to-pink-500 bg-clip-text text-transparent'>
                Wellness Revolution
              </span>
            </h1>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed'>
              Be the first to experience the future of financial therapy. Where emotional healing
              meets financial empowerment, creating lasting change that transforms lives.
            </p>
          </div>

          {/* Features Grid */}
          <div className='grid md:grid-cols-3 gap-8 mb-16'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 group'
              >
                <div
                  className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                >
                  <div className={feature.color}>{feature.icon}</div>
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3'>{feature.title}</h3>
                <p className='text-gray-600 leading-relaxed'>{feature.description}</p>
              </div>
            ))}
          </div>

          {/* Waitlist Form */}
          <div className='max-w-2xl mx-auto'>
            <div className='bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden'>
              <div className='bg-gradient-to-r from-[#9071FF] to-pink-500 p-8 text-center'>
                <Mail className='w-16 h-16 text-white mx-auto mb-4' />
                <h2 className='text-3xl font-bold text-white mb-2'>Join Our Waitlist</h2>
                <p className='text-purple-100'>
                  Be among the first to transform your relationship with money
                </p>
              </div>

              <div className='p-8'>
                <form onSubmit={handleSubmit} className='space-y-6'>
                  <div>
                    <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-2'>
                      Email Address
                    </label>
                    <input
                      type='email'
                      id='email'
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder='Enter your email address'
                      className='w-full px-4 py-3 rounded-xl border border-gray-300 shadow-sm focus:border-[#9071FF] focus:ring-2 focus:ring-[#9071FF]/20 transition-all duration-300 text-lg'
                      required
                      disabled={isSubmitting}
                    />
                  </div>

                  {error && (
                    <div className='p-4 bg-red-50 border border-red-200 rounded-lg'>
                      <p className='text-sm text-red-600'>{error}</p>
                    </div>
                  )}

                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='w-full py-4 px-6 bg-gradient-to-r from-[#9071FF] to-pink-500 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl hover:from-[#9071FF]/90 hover:to-pink-500/90 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5'
                  >
                    {isSubmitting ? (
                      <span className='flex items-center justify-center'>
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2'></div>
                        Joining Waitlist...
                      </span>
                    ) : (
                      'Join the Waitlist'
                    )}
                  </button>
                </form>

                <div className='mt-6 pt-6 border-t border-gray-100'>
                  <div className='flex items-center justify-center space-x-4 text-sm text-gray-500'>
                    <div className='flex items-center'>
                      <CheckCircle className='w-4 h-4 text-green-500 mr-1' />
                      No spam, ever
                    </div>
                    <div className='flex items-center'>
                      <CheckCircle className='w-4 h-4 text-green-500 mr-1' />
                      Early access perks
                    </div>
                    <div className='flex items-center'>
                      <CheckCircle className='w-4 h-4 text-green-500 mr-1' />
                      Unsubscribe anytime
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Proof Section */}
          <div className='text-center mt-16'>
            <p className='text-gray-500 mb-4'>Trusted by forward-thinking companies</p>
            <div className='flex items-center justify-center space-x-8 opacity-60'>
              <div className='text-2xl font-bold text-gray-400'>Company A</div>
              <div className='text-2xl font-bold text-gray-400'>Company B</div>
              <div className='text-2xl font-bold text-gray-400'>Company C</div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className='bg-gray-50 border-t border-gray-200 py-8'>
        <div className='max-w-4xl mx-auto px-4 text-center'>
          <p className='text-gray-500'>
            © {new Date().getFullYear()} Renavest. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
