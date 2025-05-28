'use client';
import { Loader2, Save, X } from 'lucide-react';
import React from 'react';

import { PhotoUpload } from './PhotoUpload';

interface TherapistProfile {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    imageUrl?: string;
  };
  therapist: {
    name?: string;
    title?: string;
    bookingURL?: string;
    expertise?: string;
    certifications?: string;
    song?: string;
    yoe?: number;
    clientele?: string;
    longBio?: string;
    previewBlurb?: string;
    profileUrl?: string;
    hourlyRate?: string;
    hourlyRateCents?: number;
    updatedAt?: string;
  };
}

interface FormData {
  name?: string;
  title?: string;
  email?: string;
  yoe?: number;
  hourlyRate?: string;
  hourlyRateCents?: number;
  expertise?: string;
  certifications?: string;
  clientele?: string;
  longBio?: string;
  bookingURL?: string;
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
}

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: TherapistProfile;
  form: FormData;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  saving: boolean;
  saveSuccess: boolean;
  error: string | null;
  isCalendarConnected: boolean;
  onPhotoUploaded: (newPhotoUrl: string) => void;
}

export function ProfileEditModal({
  isOpen,
  onClose,
  profile,
  form,
  onFormChange,
  onSave,
  saving,
  saveSuccess,
  error,
  isCalendarConnected,
  onPhotoUploaded,
}: ProfileEditModalProps) {
  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in'>
      <div className='relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 animate-scale-in'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>Edit Your Profile</h2>
          <button
            onClick={onClose}
            className='text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors'
            aria-label='Close edit profile modal'
          >
            <X className='h-6 w-6' />
          </button>
        </div>
        <form
          className='w-full flex flex-col gap-5'
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >
          {/* Photo Upload Section */}
          <PhotoUpload
            currentPhotoUrl={form.profileUrl || profile.therapist.profileUrl}
            therapistName={form.name || profile.therapist.name}
            onPhotoUploaded={onPhotoUploaded}
            disabled={saving}
            updatedAt={profile.therapist.updatedAt}
          />
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
              value={profile.user.email}
              disabled
            />
          </div>
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
              <label
                htmlFor='hourlyRate'
                className='block text-sm font-semibold text-gray-700 mb-1'
              >
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
            <label
              htmlFor='certifications'
              className='block text-sm font-semibold text-gray-700 mb-1'
            >
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
          <div className='flex gap-3 mt-6 justify-center'>
            <button
              type='submit'
              className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
              disabled={saving}
            >
              {saving ? <Loader2 className='animate-spin h-5 w-5' /> : <Save className='h-5 w-5' />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type='button'
              className='flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-lg shadow transition-colors duration-200 ease-in-out'
              onClick={onClose}
              disabled={saving}
            >
              <X className='h-5 w-5' /> Cancel
            </button>
          </div>
          {saveSuccess && (
            <p className='text-center text-green-600 font-medium mt-3 animate-fade-in'>
              Profile updated successfully!
            </p>
          )}
          {error && !saving && (
            <p className='text-center text-red-600 font-medium mt-3'>Error: {error}</p>
          )}
        </form>
      </div>
    </div>
  );
}
