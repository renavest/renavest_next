import Link from 'next/link';
import React from 'react';

import { createDate } from '@/src/utils/timezone';
export default function TermsOfService() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-primary'>Terms of Service</h1>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>1. Welcome to Renavest</h2>
        <p className='text-gray-700 mb-4'>
          Renavest is a financial therapy platform designed to support your emotional and financial
          wellness. By accessing our service, you agree to these terms that prioritize your privacy
          and personal growth.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>2. Our Commitment to Privacy</h2>
        <ul className='list-disc pl-5 text-gray-700 space-y-2'>
          <li>We collect only necessary information to provide personalized financial therapy.</li>
          <li>Your data is encrypted and protected with the highest security standards.</li>
          <li>You have complete control over your data sharing preferences.</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>3. User Responsibilities</h2>
        <ul className='list-disc pl-5 text-gray-700 space-y-2'>
          <li>Provide accurate and honest information.</li>
          <li>Maintain the confidentiality of your account.</li>
          <li>Use the platform for personal financial wellness.</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>4. Consent and Data Usage</h2>
        <p className='text-gray-700 mb-4'>By using Renavest, you consent to:</p>
        <ul className='list-disc pl-5 text-gray-700 space-y-2'>
          <li>Secure financial data aggregation</li>
          <li>Anonymized insights for platform improvement</li>
          <li>Optional sharing of progress with your financial therapist</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>5. Emotional Safety Commitment</h2>
        <p className='text-gray-700'>
          We are committed to providing a non-judgmental, supportive environment. Our platform is
          designed to empower, not criticize.
        </p>
      </section>

      <div className='mt-8 text-center'>
        <Link
          href='/login'
          className='bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors'
        >
          Back to Login
        </Link>
      </div>

      <footer className='mt-8 text-center text-gray-500'>
        <p>Last Updated: {createDate().toLocaleString()}</p>
        <p>© {createDate().year} Renavest. All rights reserved.</p>
      </footer>
    </div>
  );
}
