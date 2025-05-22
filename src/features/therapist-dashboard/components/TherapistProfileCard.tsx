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
  const [editMode, setEditMode] = useState(false);
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
  const expertiseTags = (form.expertise || therapist.expertise || '')
    .split(',')
    .map((t: string) => t.trim())
    .filter(Boolean);
  const displayImage = !imgError
    ? getTherapistImageUrl(form.profileUrl || therapist.name || user.firstName || '')
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
        {editMode ? (
          <form
            className='w-full flex flex-col gap-4 mt-2'
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Full Name</label>
              <input
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                name='name'
                value={form.name || ''}
                onChange={handleChange}
                placeholder='Full Name'
                required
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Title</label>
              <input
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                name='title'
                value={form.title || ''}
                onChange={handleChange}
                placeholder='Title'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Email</label>
              <input
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-400 border border-gray-100 cursor-not-allowed'
                name='email'
                value={user.email}
                disabled
              />
            </div>
            <div className='flex gap-4'>
              <div className='flex-1'>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Years of Experience
                </label>
                <input
                  className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                  name='yoe'
                  value={form.yoe || ''}
                  onChange={handleChange}
                  placeholder='Years'
                  type='number'
                  min={0}
                />
              </div>
              <div className='flex-1'>
                <label className='block text-xs font-semibold text-gray-600 mb-1'>
                  Hourly Rate (USD)
                </label>
                <input
                  className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                  name='hourlyRate'
                  value={form.hourlyRate || ''}
                  onChange={handleChange}
                  placeholder='Hourly Rate'
                  type='number'
                  min={0}
                />
              </div>
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>
                Areas of Expertise (comma separated)
              </label>
              <input
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                name='expertise'
                value={form.expertise || ''}
                onChange={handleChange}
                placeholder='e.g. Couples, Anxiety, Financial Therapy'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>
                Certifications
              </label>
              <input
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                name='certifications'
                value={form.certifications || ''}
                onChange={handleChange}
                placeholder='Certifications'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>
                Who I Work With
              </label>
              <input
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                name='clientele'
                value={form.clientele || ''}
                onChange={handleChange}
                placeholder='Ideal Clientele'
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>About Me</label>
              <textarea
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition min-h-[80px]'
                name='longBio'
                value={form.longBio || ''}
                onChange={handleChange}
                placeholder='Bio'
                rows={3}
              />
            </div>
            <div>
              <label className='block text-xs font-semibold text-gray-600 mb-1'>Booking URL</label>
              <input
                className='w-full bg-gray-50 rounded-lg px-3 py-2 text-gray-800 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition'
                name='bookingURL'
                value={form.bookingURL || ''}
                onChange={handleChange}
                placeholder='Booking URL'
              />
            </div>
            <div className='flex gap-3 mt-4 justify-center'>
              <button
                type='submit'
                className='flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2 rounded-lg shadow transition-colors disabled:opacity-60'
                disabled={saving}
              >
                {saving ? (
                  <Loader2 className='animate-spin h-5 w-5' />
                ) : (
                  <Save className='h-5 w-5' />
                )}
                {saving ? 'Saving...' : 'Save'}
              </button>
              <button
                type='button'
                className='flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded-lg shadow transition-colors'
                onClick={() => {
                  setEditMode(false);
                  setForm({ ...user, ...therapist });
                }}
                disabled={saving}
              >
                <X className='h-5 w-5' /> Cancel
              </button>
              {saveSuccess && <span className='text-green-600 font-medium ml-2'>Saved!</span>}
            </div>
          </form>
        ) : (
          <button
            className='flex items-center gap-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-semibold px-6 py-2 rounded-lg shadow transition-colors'
            onClick={() => setEditMode(true)}
          >
            <Pencil className='h-5 w-5' /> Edit Profile
          </button>
        )}
      </div>
    </div>
  );
}
