'use client';

import LoginForm from '@/src/features/auth/components/LoginForm';
import WelcomeSection from '@/src/features/auth/components/WelcomeSection';
import { COLORS } from '@/src/styles/colors';

export default function LoginPage() {
  return (
    <div className={`min-h-screen flex flex-col md:flex-row ${COLORS.WARM_WHITE.bg}`}>
      <WelcomeSection />
      <div className='w-full md:w-1/2 flex items-center justify-center px-6 lg:px-8'>
        <div className='sm:mx-auto sm:w-full sm:max-w-md'>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
