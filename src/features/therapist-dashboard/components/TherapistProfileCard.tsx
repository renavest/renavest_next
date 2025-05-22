import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Loader2, Pencil, Save, X } from 'lucide-react';
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

export default function TherapistProfileCard() {
  const [profile, setProfile] = useState<TherapistProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/therapist/profile')
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setProfile(data);
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
      setProfile(data);
      setEditMode(false);
      setSaveSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to save profile');
    } finally {
      setSaving(false);
      setTimeout(() => setSaveSuccess(false), 2000);
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
  if (error) {
    return (
      <div className='w-full h-full flex flex-col items-center justify-center bg-white rounded-3xl shadow-xl p-10 min-h-[500px]'>
        <X className='h-10 w-10 text-red-500 mb-4' />
        <p className='text-red-600 text-lg'>{error}</p>
      </div>
    );
  }
  if (!profile) return null;

  const { user, therapist } = profile;
  const displayImage = getTherapistImageUrl(
    form.profileUrl || therapist.name || user.firstName || '',
  );

  return (
    <div className='w-full h-full bg-white rounded-3xl shadow-xl p-10 flex flex-col items-center max-w-2xl mx-auto min-h-[500px]'>
      <div className='flex flex-col items-center mb-6'>
        <div className='relative w-28 h-28 mb-3'>
          <Image
            src={displayImage}
            alt='Profile'
            fill
            className='rounded-full object-cover border-4 border-purple-200'
          />
        </div>
        {editMode ? (
          <>
            <input
              className='text-2xl font-bold text-center text-gray-800 mb-1 bg-gray-50 rounded px-2 py-1'
              name='name'
              value={form.name || ''}
              onChange={handleChange}
              placeholder='Full Name'
            />
            <input
              className='text-lg text-center text-gray-500 mb-2 bg-gray-50 rounded px-2 py-1'
              name='title'
              value={form.title || ''}
              onChange={handleChange}
              placeholder='Title'
            />
          </>
        ) : (
          <>
            <h2 className='text-2xl font-bold text-center text-gray-800 mb-1'>
              {therapist.name || user.firstName + ' ' + user.lastName}
            </h2>
            <p className='text-lg text-center text-gray-500 mb-2'>{therapist.title}</p>
          </>
        )}
        <p className='text-sm text-gray-400'>{user.email}</p>
      </div>
      <div className='w-full flex flex-col gap-3 mb-4'>
        {editMode ? (
          <>
            <textarea
              className='w-full bg-gray-50 rounded px-3 py-2 text-gray-700'
              name='longBio'
              value={form.longBio || ''}
              onChange={handleChange}
              placeholder='Bio'
              rows={3}
            />
            <input
              className='w-full bg-gray-50 rounded px-3 py-2 text-gray-700'
              name='expertise'
              value={form.expertise || ''}
              onChange={handleChange}
              placeholder='Expertise'
            />
            <input
              className='w-full bg-gray-50 rounded px-3 py-2 text-gray-700'
              name='certifications'
              value={form.certifications || ''}
              onChange={handleChange}
              placeholder='Certifications'
            />
            <input
              className='w-full bg-gray-50 rounded px-3 py-2 text-gray-700'
              name='yoe'
              value={form.yoe || ''}
              onChange={handleChange}
              placeholder='Years of Experience'
              type='number'
              min={0}
            />
            <input
              className='w-full bg-gray-50 rounded px-3 py-2 text-gray-700'
              name='clientele'
              value={form.clientele || ''}
              onChange={handleChange}
              placeholder='Ideal Clientele'
            />
            <input
              className='w-full bg-gray-50 rounded px-3 py-2 text-gray-700'
              name='hourlyRate'
              value={form.hourlyRate || ''}
              onChange={handleChange}
              placeholder='Hourly Rate (USD)'
              type='number'
              min={0}
            />
            <input
              className='w-full bg-gray-50 rounded px-3 py-2 text-gray-700'
              name='bookingURL'
              value={form.bookingURL || ''}
              onChange={handleChange}
              placeholder='Booking URL'
            />
          </>
        ) : (
          <>
            {therapist.longBio && (
              <p className='text-gray-700 whitespace-pre-line mb-2'>{therapist.longBio}</p>
            )}
            <div className='flex flex-wrap gap-2 mb-2'>
              {therapist.expertise && (
                <span className='bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs'>
                  {therapist.expertise}
                </span>
              )}
              {therapist.certifications && (
                <span className='bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs'>
                  {therapist.certifications}
                </span>
              )}
              {therapist.clientele && (
                <span className='bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs'>
                  {therapist.clientele}
                </span>
              )}
            </div>
            <div className='flex flex-wrap gap-2 mb-2'>
              {therapist.yoe && (
                <span className='bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs'>
                  {therapist.yoe} yrs exp
                </span>
              )}
              {therapist.hourlyRate && (
                <span className='bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs'>
                  ${therapist.hourlyRate}/hr
                </span>
              )}
            </div>
            {therapist.bookingURL && (
              <a
                href={therapist.bookingURL}
                target='_blank'
                rel='noopener noreferrer'
                className='text-purple-600 underline text-sm'
              >
                Book a session
              </a>
            )}
          </>
        )}
      </div>
      <div className='flex gap-3 mt-4'>
        {editMode ? (
          <>
            <button
              className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors disabled:opacity-60'
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? <Loader2 className='animate-spin h-5 w-5' /> : <Save className='h-5 w-5' />}
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              className='flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition-colors'
              onClick={() => {
                setEditMode(false);
                setForm({ ...user, ...therapist });
              }}
              disabled={saving}
            >
              <X className='h-5 w-5' /> Cancel
            </button>
          </>
        ) : (
          <button
            className='flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-6 py-2 rounded-lg shadow transition-colors'
            onClick={() => setEditMode(true)}
          >
            <Pencil className='h-5 w-5' /> Edit Profile
          </button>
        )}
        {saveSuccess && <span className='text-green-600 font-medium ml-2'>Saved!</span>}
      </div>
    </div>
  );
}
