'use client';

import { useRouter } from 'next/navigation';

import LoginForm from '@/src/features/auth/components/LoginForm';
import WelcomeSection from '@/src/features/auth/components/WelcomeSection';
import { authState } from '@/src/features/auth/state/authState';
import { setUserVerified } from '@/src/features/auth/utils/auth';

export default function Login() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
    setUserVerified(authState.value.email);
  };

  return (
    <div className='min-h-screen flex flex-col md:flex-row bg-[#faf9f6]'>
      <WelcomeSection />
      <LoginForm onSubmit={handleSubmit} />
    </div>
  );
}
