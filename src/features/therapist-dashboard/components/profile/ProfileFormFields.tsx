'use client';
import React from 'react';

import { ProfileFormData } from '../../types/profile';
import { PhotoUpload } from './PhotoUpload';

interface ProfileFormFieldsProps {
  form: ProfileFormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onPhotoUploaded: (newPhotoUrl: string) => void;
  saving: boolean;
  isCalendarConnected: boolean;
  email: string;
  updatedAt?: string;
}

export function ProfileFormFields({
  form,
  onFormChange,
  onPhotoUploaded,
  saving,
  isCalendarConnected,
  email,
  updatedAt,
}: ProfileFormFieldsProps) {
  return (
    <>
      {/* Photo Upload Section */}
      <PhotoUpload
        currentPhotoUrl={form.profileUrl}
        therapistName={form.name}
        onPhotoUploaded={onPhotoUploaded}
        disabled={saving}
        updatedAt={updatedAt}
      />

      {/* Basic Information */}
      <div>
        <label htmlFor='name' className='block text-sm font-semibold text-gray-700 mb-1'>
          Full Name
        </label>
        <input
          id='name'
          className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out'
          name='name'
          value={form.name || ''}
          onChange={onFormChange}
          placeholder='Enter your full name'
          required
        />
      </div>

      <div>
        <label htmlFor='title' className='block text-sm font-semibold text-gray-700 mb-1'>
          Title
        </label>
        <input
          id='title'
          className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out'
          name='title'
          value={form.title || ''}
          onChange={onFormChange}
          placeholder='e.g., Licensed Marriage and Family Therapist'
        />
      </div>

      <div>
        <label htmlFor='email' className='block text-sm font-semibold text-gray-700 mb-1'>
          Email
        </label>
        <input
          id='email'
          className='w-full bg-gray-100 rounded-lg px-4 py-2.5 text-gray-500 border border-gray-200 cursor-not-allowed'
          name='email'
          value={email}
          disabled
        />
      </div>

      {/* Experience and Rate */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
        <div>
          <label htmlFor='yoe' className='block text-sm font-semibold text-gray-700 mb-1'>
            Years of Experience
          </label>
          <input
            id='yoe'
            className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out'
            name='yoe'
            value={form.yoe || ''}
            onChange={onFormChange}
            placeholder='e.g., 5'
            type='number'
            min={0}
          />
        </div>
        <div>
          <label htmlFor='hourlyRate' className='block text-sm font-semibold text-gray-700 mb-1'>
            Hourly Rate (USD)
          </label>
          <input
            id='hourlyRate'
            className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out'
            name='hourlyRate'
            value={form.hourlyRate || ''}
            onChange={onFormChange}
            placeholder='e.g., 150.00'
            type='number'
            min={0}
            step='0.01'
          />
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <label htmlFor='expertise' className='block text-sm font-semibold text-gray-700 mb-1'>
          Areas of Expertise (comma separated)
        </label>
        <textarea
          id='expertise'
          className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out min-h-[60px] resize-y'
          name='expertise'
          value={form.expertise || ''}
          onChange={onFormChange}
          placeholder='e.g., Couples, Anxiety, Financial Therapy, Trauma'
          rows={2}
        />
      </div>

      <div>
        <label htmlFor='certifications' className='block text-sm font-semibold text-gray-700 mb-1'>
          Certifications
        </label>
        <textarea
          id='certifications'
          className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out min-h-[60px] resize-y'
          name='certifications'
          value={form.certifications || ''}
          onChange={onFormChange}
          placeholder='e.g., EMDR Certified, CBT Specialist, Gottman Method'
          rows={2}
        />
      </div>

      <div>
        <label htmlFor='clientele' className='block text-sm font-semibold text-gray-700 mb-1'>
          Who I Work With
        </label>
        <textarea
          id='clientele'
          className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out min-h-[60px] resize-y'
          name='clientele'
          value={form.clientele || ''}
          onChange={onFormChange}
          placeholder='e.g., Adults, Adolescents, Couples, Families, LGBTQ+ individuals'
          rows={2}
        />
      </div>

      <div>
        <label htmlFor='longBio' className='block text-sm font-semibold text-gray-700 mb-1'>
          About Me (Long Bio)
        </label>
        <textarea
          id='longBio'
          className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out min-h-[120px] resize-y'
          name='longBio'
          value={form.longBio || ''}
          onChange={onFormChange}
          placeholder='Provide a detailed description of your approach, philosophy, and what clients can expect when working with you.'
          rows={5}
        />
      </div>

      {/* Booking URL */}
      <div>
        <label htmlFor='bookingURL' className='block text-sm font-semibold text-gray-700 mb-1'>
          Booking URL
          {isCalendarConnected && (
            <span className='ml-2 text-xs text-green-600 font-medium'>
              (Disabled - Google Calendar Connected)
            </span>
          )}
        </label>
        <input
          id='bookingURL'
          className={`w-full rounded-lg px-4 py-2.5 border transition duration-200 ease-in-out ${
            isCalendarConnected
              ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
              : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200'
          }`}
          name='bookingURL'
          value={form.bookingURL || ''}
          onChange={onFormChange}
          placeholder={
            isCalendarConnected
              ? 'Booking managed through Google Calendar'
              : 'e.g., https://yourbookinglink.com'
          }
          type='url'
          disabled={isCalendarConnected}
        />
        {isCalendarConnected && (
          <p className='text-xs text-gray-500 mt-1'>
            Since Google Calendar is connected, bookings are managed through your calendar
            integration. Disconnect Google Calendar to use a custom booking URL.
          </p>
        )}
      </div>
    </>
  );
}
