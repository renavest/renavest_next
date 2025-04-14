import React from 'react';
import Link from 'next/link';

export default function PrivacyPolicy() {
  return (
    <div className='container mx-auto px-4 py-8 max-w-4xl'>
      <h1 className='text-3xl font-bold mb-6 text-primary'>Privacy Policy</h1>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>1. Our Privacy Promise</h2>
        <p className='text-gray-700 mb-4'>
          At Renavest, we believe your personal and financial information is sacred. Our commitment
          is to protect your data with the same care we provide emotional support.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>2. What We Collect</h2>
        <ul className='list-disc pl-5 text-gray-700 space-y-2'>
          <li>Minimal personal information necessary for financial therapy</li>
          <li>Anonymized financial insights for platform improvement</li>
          <li>Optional emotional wellness check-in data</li>
        </ul>
        <p className='text-gray-700 mt-4'>
          We collect only what is essential to provide personalized, compassionate support.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>3. How We Protect Your Data</h2>
        <ul className='list-disc pl-5 text-gray-700 space-y-2'>
          <li>Bank-grade encryption for all sensitive information</li>
          <li>Regular security audits and updates</li>
          <li>Strict access controls for our team</li>
          <li>Local data processing when possible</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>4. Your Data, Your Control</h2>
        <p className='text-gray-700 mb-4'>
          We empower you with complete control over your personal information:
        </p>
        <ul className='list-disc pl-5 text-gray-700 space-y-2'>
          <li>Granular consent settings</li>
          <li>Easy data export and deletion</li>
          <li>Transparent data sharing options</li>
          <li>Opt-out of non-essential data collection</li>
        </ul>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>5. Emotional Safety First</h2>
        <p className='text-gray-700'>
          Your emotional well-being guides our data practices. We never use your personal
          information for judgment, only for supportive, personalized guidance.
        </p>
      </section>

      <section className='mb-6'>
        <h2 className='text-2xl font-semibold mb-4'>6. Third-Party Sharing</h2>
        <p className='text-gray-700'>We do not sell your data. Any third-party connections are:</p>
        <ul className='list-disc pl-5 text-gray-700 space-y-2'>
          <li>Explicitly consented by you</li>
          <li>Strictly for financial therapy purposes</li>
          <li>Processed with the highest privacy standards</li>
        </ul>
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
        <p>Last Updated: {new Date().toLocaleDateString()}</p>
        <p>© {new Date().getFullYear()} Renavest. Your Privacy, Our Priority.</p>
      </footer>
    </div>
  );
}
