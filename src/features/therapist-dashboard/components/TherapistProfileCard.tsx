'use client';
import { Loader2, Pencil, Save, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

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
  };
}

const PLACEHOLDER = '/experts/placeholderexp.png';

function ExpertiseTags({ tags }: { tags: string[] }) {
  if (!tags.length) return null;
  return (
    <div className='mt-2 flex items-start flex-wrap gap-1 min-h-[1.5rem] overflow-hidden'>
      {tags.slice(0, 3).map((exp, index) => (
        <span
          key={index}
          className='px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 font-medium'
        >
          {exp.trim()}
        </span>
      ))}
      {tags.length > 3 && (
        <span className='px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700 font-medium'>
          +{tags.length - 3}
        </span>
      )}
    </div>
  );
}

export default function TherapistProfileCard() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false); // Controls modal visibility
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/therapist/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
        // Initialize form with existing profile data
        setForm({ ...data.user, ...data.therapist });
        setError(null);
      })
      .catch((err) => setError(err.message || 'Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev: any) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setError(null);
    try {
      const res = await fetch('/api/therapist/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save profile');
      setProfile(data); // Update main profile state with saved data
      setIsModalOpen(false); // Close the modal
      setSaveSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 2000); // Hide success message after 2 seconds
    }
  };

  const openEditModal = () => {
    // Set form data to current profile data when opening the modal
    if (profile) {
      setForm({ ...profile.user, ...profile.therapist });
    }
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setIsModalOpen(false);
    // Reset form to current profile data if canceled
    if (profile) {
      setForm({ ...profile.user, ...profile.therapist });
    }
  };

  if (loading) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <Loader2 className='animate-spin h-10 w-10 text-purple-600 mb-4' />
        <p className='text-purple-700 text-lg'>Loading profile...</p>
      </div>
    );
  }
  if (error && !isModalOpen) {
    // Only show global error if modal isn't open
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <X className='h-10 w-10 text-red-500 mb-4' />
        <p className='text-red-600 text-lg'>{error}</p>
      </div>
    );
  }
  if (!profile) return null;

  const { user, therapist } = profile;
  // Display current profile expertise, not form expertise, when not in edit mode
  const expertiseTags = (therapist.expertise || '')
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean);
  const displayImage = !imgError
    ? getTherapistImageUrl(therapist.profileUrl || therapist.name || user.firstName || '')
    : PLACEHOLDER;

  return (
    <div className='w-full h-full bg-white rounded-3xl shadow-2xl p-8 flex flex-col items-center max-w-xl mx-auto min-h-[540px] border border-purple-100'>
      <div className='flex flex-col items-center mb-6 w-full'>
        <div className='relative w-32 h-32 mb-3 rounded-2xl overflow-hidden bg-gray-100 flex items-center justify-center'>
          {!imgLoaded && !imgError && (
            <div
              className='absolute inset-0 bg-gray-200 animate-pulse rounded-2xl'
              aria-label='Image loading placeholder'
            />
          )}
          <Image
            src={displayImage}
            alt={therapist.name || user.firstName || 'Profile'}
            fill
            className='object-cover object-center rounded-2xl border-4 border-purple-100'
            onLoadingComplete={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            priority
          />
        </div>
        <h2 className='text-2xl font-bold text-center text-gray-900 mb-1'>
          {therapist.name || user.firstName + ' ' + user.lastName}
        </h2>
        <p className='text-lg text-center text-gray-600 mb-1 font-medium'>{therapist.title}</p>
        <p className='text-sm text-gray-400 mb-2'>{user.email}</p>
      </div>
      <div className='w-full flex flex-col gap-4 mb-4'>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Years of Experience</h3>
          <span className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-medium'>
            {therapist.yoe ? `${therapist.yoe} years` : 'N/A'}
          </span>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Areas of Expertise</h3>
          <ExpertiseTags tags={expertiseTags} />
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Certifications</h3>
          <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium'>
            {therapist.certifications || 'Not specified'}
          </span>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>Who I Work With</h3>
          <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium'>
            {therapist.clientele || 'Not specified'}
          </span>
        </div>
        <div>
          <h3 className='text-sm font-semibold text-gray-700 mb-1'>About Me</h3>
          <p className='text-gray-700 whitespace-pre-line text-base leading-relaxed'>
            {therapist.longBio || 'No bio provided.'}
          </p>
        </div>
        {therapist.bookingURL && (
          <div>
            <h3 className='text-sm font-semibold text-gray-700 mb-1'>Booking Link</h3>
            <a
              href={therapist.bookingURL}
              target='_blank'
              rel='noopener noreferrer'
              className='text-purple-600 underline text-sm font-medium mt-2'
            >
              Book a session
            </a>
          </div>
        )}
      </div>
      <div className='flex gap-3 mt-4'>
        <button
          className='flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-6 py-2 rounded-lg shadow transition-colors'
          onClick={openEditModal} // Open the modal
        >
          <Pencil className='h-5 w-5' /> Edit Profile
        </button>
      </div>

      {/* Tailwind CSS Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-60 p-4 animate-fade-in'>
          <div className='relative bg-white rounded-xl shadow-2xl p-6 sm:p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto transform scale-100 opacity-100 animate-scale-in'>
            <div className='flex justify-between items-center mb-6'>
              <h2 className='text-2xl font-bold text-gray-900'>Edit Your Profile</h2>
              <button
                onClick={closeEditModal}
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
              <div>
                <label htmlFor='name' className='block text-sm font-semibold text-gray-700 mb-1'>
                  Full Name
                </label>
                <input
                  id='name'
                  className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out'
                  name='name'
                  value={form.name || ''}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  value={user.email}
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
                    onChange={handleChange}
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
                    onChange={handleChange}
                    placeholder='e.g., 150.00'
                    type='number'
                    min={0}
                    step='0.01'
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor='expertise'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Areas of Expertise (comma separated)
                </label>
                <textarea
                  id='expertise'
                  className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out min-h-[60px] resize-y'
                  name='expertise'
                  value={form.expertise || ''}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder='e.g., EMDR Certified, CBT Specialist, Gottman Method'
                  rows={2}
                />
              </div>
              <div>
                <label
                  htmlFor='clientele'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Who I Work With
                </label>
                <textarea
                  id='clientele'
                  className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out min-h-[60px] resize-y'
                  name='clientele'
                  value={form.clientele || ''}
                  onChange={handleChange}
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
                  onChange={handleChange}
                  placeholder='Provide a detailed description of your approach, philosophy, and what clients can expect when working with you.'
                  rows={5}
                />
              </div>
              <div>
                <label
                  htmlFor='bookingURL'
                  className='block text-sm font-semibold text-gray-700 mb-1'
                >
                  Booking URL
                </label>
                <input
                  id='bookingURL'
                  className='w-full bg-gray-50 rounded-lg px-4 py-2.5 text-gray-800 border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition duration-200 ease-in-out'
                  name='bookingURL'
                  value={form.bookingURL || ''}
                  onChange={handleChange}
                  placeholder='e.g., https://yourbookinglink.com'
                  type='url'
                />
              </div>
              <div className='flex gap-3 mt-6 justify-center'>
                <button
                  type='submit'
                  className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow transition-colors duration-200 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed'
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className='animate-spin h-5 w-5' />
                  ) : (
                    <Save className='h-5 w-5' />
                  )}
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type='button'
                  className='flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2.5 rounded-lg shadow transition-colors duration-200 ease-in-out'
                  onClick={closeEditModal} // Close on cancel
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
      )}
    </div>
  );
}
