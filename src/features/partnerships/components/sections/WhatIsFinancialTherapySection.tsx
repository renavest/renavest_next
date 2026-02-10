'use client';
import { Brain, Heart, Send, Shield, TrendingUp } from 'lucide-react';
import posthog from 'posthog-js';
import type { ChangeEvent, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

type PartnershipFormState = {
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  partnerType: string;
  message: string;
};

function WhatIsFinancialTherapySection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [hasSectionBeenViewed, setHasSectionBeenViewed] = useState(false);
  const [formState, setFormState] = useState<PartnershipFormState>({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    partnerType: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    const observer = new window.IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasSectionBeenViewed) {
          setHasSectionBeenViewed(true);

          // Track when section becomes visible
          if (typeof window !== 'undefined') {
            posthog.capture('partnerships_section_viewed', {
              section_name: 'partnerships_what_is_financial_therapy',
              url: window.location.href,
            });
          }
        }
      },
      { threshold: 0.1 },
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [hasSectionBeenViewed]);

  const trackCardHover = (cardName: string) => {
    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_financial_therapy_card_hover', {
        card_name: cardName,
        section: 'partnerships_what_is_financial_therapy',
        url: window.location.href,
      });
    }
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
  };

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitError('');

    if (typeof window !== 'undefined') {
      posthog.capture('partnerships_contact_form_submitted', {
        source: 'partnerships_financial_therapy_section',
        url: window.location.href,
        partner_type: formState.partnerType || null,
      });
    }

    try {
      const fullName = `${formState.firstName} ${formState.lastName}`.trim();
      const safeMessage = escapeHtml(formState.message);
      const safeCompany = escapeHtml(formState.company);
      const safePartnerType = escapeHtml(formState.partnerType);
      const safeEmail = escapeHtml(formState.email);
      const safeName = escapeHtml(fullName || 'Unknown');

      const response = await fetch('/api/notifications/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: 'rameau.stan@gmail.com',
          subject: `Partnership inquiry${safeCompany ? ` - ${safeCompany}` : ''}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #111827;">
              <h2 style="margin: 0 0 12px 0;">New Partnership Inquiry</h2>
              <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${safeName}</p>
              <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${safeEmail}</p>
              ${safeCompany ? `<p style="margin: 0 0 8px 0;"><strong>Company:</strong> ${safeCompany}</p>` : ''}
              ${safePartnerType ? `<p style="margin: 0 0 8px 0;"><strong>Partner Type:</strong> ${safePartnerType}</p>` : ''}
              <p style="margin: 16px 0 8px 0;"><strong>Message:</strong></p>
              <div style="white-space: pre-wrap; background: #f9fafb; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb;">
                ${safeMessage || 'No message provided.'}
              </div>
            </div>
          `,
          text: [
            'New Partnership Inquiry',
            '',
            `Name: ${fullName || 'Unknown'}`,
            `Email: ${formState.email || 'Unknown'}`,
            formState.company ? `Company: ${formState.company}` : null,
            formState.partnerType ? `Partner Type: ${formState.partnerType}` : null,
            '',
            'Message:',
            formState.message || 'No message provided.',
          ]
            .filter(Boolean)
            .join('\n'),
        }),
      });

      if (!response.ok) {
        throw new Error('Unable to send your message. Please try again.');
      }

      setSubmitStatus('success');
      setFormState({
        firstName: '',
        lastName: '',
        email: '',
        company: '',
        partnerType: '',
        message: '',
      });
    } catch (error) {
      setSubmitStatus('error');
      setSubmitError(error instanceof Error ? error.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <span id='what-is-financial-therapy' className='block scroll-mt-16'></span>
      <section ref={sectionRef} className='py-20 bg-white'>
        <div className='max-w-6xl mx-auto px-6 md:px-10'>
          <div className='text-center mb-16'>
            <span className='px-4 py-2 bg-[#9071FF]/10 text-[#9071FF] font-medium rounded-full text-sm mb-6 inline-block'>
              WHY PARTNER WITH US?
            </span>
            <h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-6'>
              We're <span className='text-[#9071FF]'>Building the Future</span> of Financial Wellness
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed'>
              Join us in revolutionizing how people approach their relationship with money.
              <span className='block mt-2 font-medium text-gray-800'>
                Together, we can create lasting change.
              </span>
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16'>
            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('market_opportunity')}
            >
              <div className='w-16 h-16 bg-[#9071FF] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#9071FF]/20 transition-all duration-300'>
                <Heart className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Growing Market</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Financial therapy is rapidly expanding as organizations recognize the need for comprehensive financial wellness.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('proven_results')}
            >
              <div className='w-16 h-16 bg-[#7c3aed] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#7c3aed]/20 transition-all duration-300'>
                <TrendingUp className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>
                Proven Results
              </h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Our platform delivers measurable outcomes for both individuals and organizations.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('comprehensive_support')}
            >
              <div className='w-16 h-16 bg-[#6366f1] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#6366f1]/20 transition-all duration-300'>
                <Shield className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Full Support</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Dedicated partner success team, training resources, and ongoing technical support.
              </p>
            </div>

            <div
              className='text-center group hover:transform hover:scale-105 transition-all duration-300'
              onMouseEnter={() => trackCardHover('innovation_focus')}
            >
              <div className='w-16 h-16 bg-[#8b5cf6] rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:shadow-lg group-hover:shadow-[#8b5cf6]/20 transition-all duration-300'>
                <Brain className='h-8 w-8 text-white' />
              </div>
              <h3 className='text-lg font-semibold mb-3 text-gray-900'>Continuous Innovation</h3>
              <p className='text-gray-600 text-sm leading-relaxed'>
                Regular platform updates, new features, and cutting-edge financial wellness tools.
              </p>
            </div>
          </div>

          <div className='bg-gradient-to-br from-[#9071FF]/5 via-purple-50/50 to-indigo-50/30 rounded-3xl p-8 md:p-12 text-center border border-[#9071FF]/10'>
            <h3 className='text-2xl md:text-3xl font-bold text-gray-900 mb-6'>
              Ready to Explore Partnership Opportunities?
            </h3>
            <p className='text-lg text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed'>
              Tell us a bit about your organization and partnership goals. We will follow up within 1-2 business
              days.
            </p>
            <form
              onSubmit={handleSubmit}
              className='max-w-3xl mx-auto text-left grid gap-4 md:grid-cols-2'
            >
              <label className='block text-sm font-semibold text-gray-700'>
                First name
                <input
                  name='firstName'
                  value={formState.firstName}
                  onChange={handleInputChange}
                  type='text'
                  required
                  className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-[#9071FF] focus:outline-none focus:ring-2 focus:ring-[#9071FF]/20'
                  placeholder='Jordan'
                />
              </label>
              <label className='block text-sm font-semibold text-gray-700'>
                Last name
                <input
                  name='lastName'
                  value={formState.lastName}
                  onChange={handleInputChange}
                  type='text'
                  required
                  className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-[#9071FF] focus:outline-none focus:ring-2 focus:ring-[#9071FF]/20'
                  placeholder='Lee'
                />
              </label>
              <label className='block text-sm font-semibold text-gray-700'>
                Work email
                <input
                  name='email'
                  value={formState.email}
                  onChange={handleInputChange}
                  type='email'
                  required
                  className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-[#9071FF] focus:outline-none focus:ring-2 focus:ring-[#9071FF]/20'
                  placeholder='jordan@company.com'
                />
              </label>
              <label className='block text-sm font-semibold text-gray-700'>
                Company
                <input
                  name='company'
                  value={formState.company}
                  onChange={handleInputChange}
                  type='text'
                  className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-[#9071FF] focus:outline-none focus:ring-2 focus:ring-[#9071FF]/20'
                  placeholder='Acme Wellness'
                />
              </label>
              <label className='block text-sm font-semibold text-gray-700 md:col-span-2'>
                Partnership type
                <select
                  name='partnerType'
                  value={formState.partnerType}
                  onChange={handleInputChange}
                  className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-[#9071FF] focus:outline-none focus:ring-2 focus:ring-[#9071FF]/20'
                >
                  <option value=''>Select an option</option>
                  <option value='Therapist network'>Therapist network</option>
                  <option value='Corporate wellness'>Corporate wellness</option>
                  <option value='Platform integration'>Platform integration</option>
                  <option value='Research collaboration'>Research collaboration</option>
                  <option value='Other'>Other</option>
                </select>
              </label>
              <label className='block text-sm font-semibold text-gray-700 md:col-span-2'>
                Message
                <textarea
                  name='message'
                  value={formState.message}
                  onChange={handleInputChange}
                  required
                  rows={5}
                  className='mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 shadow-sm focus:border-[#9071FF] focus:outline-none focus:ring-2 focus:ring-[#9071FF]/20'
                  placeholder='Share a quick overview of your partnership goals...'
                />
              </label>
              <div className='md:col-span-2 flex flex-col items-start gap-3'>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='inline-flex items-center gap-2 px-8 py-4 bg-[#9071FF] text-white rounded-xl hover:bg-[#9071FF]/90 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl hover:shadow-[#9071FF]/20 disabled:opacity-60 disabled:cursor-not-allowed'
                >
                  {isSubmitting ? 'Sending...' : 'Send partnership request'}
                  <Send className='w-5 h-5' />
                </button>
                {submitStatus === 'success' && (
                  <p className='text-sm font-medium text-green-600'>
                    Thanks! Your message has been sent. We will be in touch shortly.
                  </p>
                )}
                {submitStatus === 'error' && (
                  <p className='text-sm font-medium text-red-600'>
                    {submitError || 'Unable to send your message. Please try again.'}
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}

export default WhatIsFinancialTherapySection;
