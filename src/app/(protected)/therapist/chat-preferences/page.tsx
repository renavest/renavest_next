'use client';

import { useUser } from '@clerk/nextjs';
import { MessageCircle, Clock, Users, Bell } from 'lucide-react';
import { useEffect, useState } from 'react';

import TherapistNavbar from '@/src/features/therapist-dashboard/components/navigation/TherapistNavbar';

// Feature flag check
const CHAT_FEATURE_ENABLED = process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true';

interface ChatPreferences {
  acceptingChats: boolean;
  maxActiveChats: number;
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
  businessHoursOnly: boolean;
  businessHoursStart: string;
  businessHoursEnd: string;
  timezone: string;
}

export default function ChatPreferencesPage() {
  const { user } = useUser();
  const [preferences, setPreferences] = useState<ChatPreferences>({
    acceptingChats: false,
    maxActiveChats: 5,
    autoReplyEnabled: false,
    autoReplyMessage: 'Thank you for reaching out! I will get back to you as soon as possible.',
    businessHoursOnly: true,
    businessHoursStart: '09:00',
    businessHoursEnd: '17:00',
    timezone: 'UTC',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Fetch current preferences
    fetchPreferences();
  }, [user]);

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/therapist/chat-preferences');
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences(data.preferences);
        }
      }
    } catch (error) {
      console.error('Failed to fetch chat preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/therapist/chat-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences),
      });

      if (response.ok) {
        // Show success message
        console.log('Preferences saved successfully');
      } else {
        console.error('Failed to save preferences');
      }
    } catch (error) {
      console.error('Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleAcceptingChats = () => {
    setPreferences((prev) => ({
      ...prev,
      acceptingChats: !prev.acceptingChats,
    }));
  };

  // Early return if feature is disabled
  if (!CHAT_FEATURE_ENABLED) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
        <TherapistNavbar
          pageTitle='Chat Preferences'
          showBackButton={true}
          backButtonHref='/therapist'
        />
        <div className='max-w-4xl mx-auto mt-10'>
          <div className='bg-blue-50 border border-blue-200 rounded-lg p-6 text-center'>
            <MessageCircle className='w-12 h-12 text-blue-600 mx-auto mb-4' />
            <h3 className='text-lg font-semibold text-blue-900 mb-2'>Chat Feature Coming Soon</h3>
            <p className='text-blue-700'>
              The chat feature is currently in development and will be available soon.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
        <TherapistNavbar
          pageTitle='Chat Preferences'
          showBackButton={true}
          backButtonHref='/therapist'
        />
        <div className='max-w-4xl mx-auto mt-10'>
          <div className='flex items-center justify-center py-12'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600'></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='container mx-auto px-4 md:px-6 py-8 pt-20 sm:pt-24 bg-[#faf9f6] min-h-screen'>
      <TherapistNavbar
        pageTitle='Chat Preferences'
        showBackButton={true}
        backButtonHref='/therapist'
      />

      <div className='max-w-4xl mx-auto mt-10'>
        <div className='mb-8'>
          <h1 className='text-3xl font-bold text-gray-900 mb-3'>Chat Preferences</h1>
          <p className='text-gray-600 text-lg'>
            Manage how you receive and respond to chat requests from prospective clients.
          </p>
        </div>

        <div className='space-y-6'>
          {/* Main Toggle */}
          <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-3'>
                <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center'>
                  <MessageCircle className='w-6 h-6 text-purple-600' />
                </div>
                <div>
                  <h3 className='text-lg font-semibold text-gray-900'>Accept Chat Requests</h3>
                  <p className='text-gray-600 text-sm'>
                    Allow prospective clients to start conversations with you
                  </p>
                </div>
              </div>
              <button
                onClick={handleToggleAcceptingChats}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.acceptingChats ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.acceptingChats ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {preferences.acceptingChats && (
            <>
              {/* Chat Limits */}
              <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center'>
                    <Users className='w-6 h-6 text-blue-600' />
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Chat Limits</h3>
                    <p className='text-gray-600 text-sm'>
                      Set the maximum number of active conversations you can handle
                    </p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Maximum active chats
                    </label>
                    <input
                      type='number'
                      min='1'
                      max='20'
                      value={preferences.maxActiveChats}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          maxActiveChats: parseInt(e.target.value) || 5,
                        }))
                      }
                      className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500'
                    />
                  </div>
                </div>
              </div>

              {/* Business Hours */}
              <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center'>
                    <Clock className='w-6 h-6 text-green-600' />
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Availability</h3>
                    <p className='text-gray-600 text-sm'>
                      Set when you're available to receive new chat requests
                    </p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-700'>
                      Only accept chats during business hours
                    </span>
                    <button
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          businessHoursOnly: !prev.businessHoursOnly,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.businessHoursOnly ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.businessHoursOnly ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {preferences.businessHoursOnly && (
                    <div className='grid grid-cols-2 gap-4'>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          Start time
                        </label>
                        <input
                          type='time'
                          value={preferences.businessHoursStart}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              businessHoursStart: e.target.value,
                            }))
                          }
                          className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                        />
                      </div>
                      <div>
                        <label className='block text-sm font-medium text-gray-700 mb-2'>
                          End time
                        </label>
                        <input
                          type='time'
                          value={preferences.businessHoursEnd}
                          onChange={(e) =>
                            setPreferences((prev) => ({
                              ...prev,
                              businessHoursEnd: e.target.value,
                            }))
                          }
                          className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500'
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Auto Reply */}
              <div className='bg-white border border-gray-200 rounded-xl p-6 shadow-sm'>
                <div className='flex items-center gap-3 mb-4'>
                  <div className='w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center'>
                    <Bell className='w-6 h-6 text-orange-600' />
                  </div>
                  <div>
                    <h3 className='text-lg font-semibold text-gray-900'>Auto Reply</h3>
                    <p className='text-gray-600 text-sm'>
                      Automatically respond to new chat requests
                    </p>
                  </div>
                </div>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <span className='text-sm font-medium text-gray-700'>
                      Enable auto reply for new chats
                    </span>
                    <button
                      onClick={() =>
                        setPreferences((prev) => ({
                          ...prev,
                          autoReplyEnabled: !prev.autoReplyEnabled,
                        }))
                      }
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        preferences.autoReplyEnabled ? 'bg-orange-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          preferences.autoReplyEnabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {preferences.autoReplyEnabled && (
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Auto reply message
                      </label>
                      <textarea
                        rows={3}
                        value={preferences.autoReplyMessage}
                        onChange={(e) =>
                          setPreferences((prev) => ({
                            ...prev,
                            autoReplyMessage: e.target.value,
                          }))
                        }
                        className='block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500'
                        placeholder='Enter your automatic reply message...'
                      />
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Save Button */}
          <div className='flex justify-end'>
            <button
              onClick={savePreferences}
              disabled={saving}
              className='px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
            >
              {saving ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
