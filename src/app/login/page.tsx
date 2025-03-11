'use client';

import { useRouter } from 'next/navigation';

import LoginForm from '@/src/features/auth/components/LoginForm';
import WelcomeSection from '@/src/features/auth/components/WelcomeSection';
import { authState } from '@/src/features/auth/state/authState';
import { setUserVerified } from '@/src/features/auth/utils/auth';
import { COLORS } from '@/src/styles/colors';

export default function LoginPage() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
    setUserVerified(authState.value.email);
  };

  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${COLORS.WARM_WHITE.bg}`}>
      <WelcomeSection />
      <div className='w-full md:w-1/2 flex items-center justify-center px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <LoginForm onSubmit={handleSubmit} />
        </div>
      </div>
    </div>
  );
}
