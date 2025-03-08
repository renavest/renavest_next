'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { authSignal, setAuthError } from '../state/authSignals';
import { setUserVerified } from '../utils/auth';

import LoginForm from './LoginForm';
import WelcomeSection from './WelcomeSection';

export default function LoginPage() {
  const router = useRouter();
  const auth = authSignal.value;

  useEffect(() => {
    // Reset auth state when component mounts
    authSignal.value = {
      email: '',
      password: '',
      isLoading: false,
      error: undefined,
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!auth.email || !auth.password) {
        setAuthError('Please fill in all fields');
        return;
      }

      setUserVerified(auth.email);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setAuthError('An error occurred during login');
    }
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-[#faf9f6]'>
      <WelcomeSection />
      <LoginForm onSubmit={handleSubmit} />
    </div>
  );
}
