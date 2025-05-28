'use client';
import { Loader2, Save, X } from 'lucide-react';
import React from 'react';

import {
  profileSignal,
  profileModalOpenSignal,
  profileFormSignal,
  profileSavingSignal,
  profileSaveSuccessSignal,
  profileErrorSignal,
  isCalendarConnectedSignal,
  profileActions,
} from '../../state/profileState';

import { ProfileFormFields } from './ProfileFormFields';

export function ProfileEditModal() {
  const isOpen = profileModalOpenSignal.value;
  const profile = profileSignal.value;
  const form = profileFormSignal.value;
  const saving = profileSavingSignal.value;
  const saveSuccess = profileSaveSuccessSignal.value;
  const error = profileErrorSignal.value;
  const isCalendarConnected = isCalendarConnectedSignal.value;

  if (!isOpen || !profile) return null;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const parsedValue = e.target.type === 'number' ? (value ? parseFloat(value) : '') : value;
    profileActions.updateFormField(name as keyof typeof form, parsedValue);
  };

  const handleSave = () => {
    profileActions.saveProfile();
  };

  const handleClose = () => {
    profileActions.closeModal();
  };

  const handlePhotoUploaded = (newPhotoUrl: string) => {
    profileActions.updatePhotoUrl(newPhotoUrl);
  };

  return (
    <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in'>
      <div className='relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 animate-scale-in'>
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>Edit Your Profile</h2>
          <button
            onClick={handleClose}
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
            handleSave();
          }}
        >
          <ProfileFormFields
            form={form}
            onFormChange={handleFormChange}
            onPhotoUploaded={handlePhotoUploaded}
            saving={saving}
            isCalendarConnected={isCalendarConnected}
            email={profile.user.email}
            updatedAt={profile.therapist.updatedAt}
          />

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
              onClick={handleClose}
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
