'use client';

import { useRouter } from 'next/navigation';
import type { UserResource } from '@clerk/types';
import { User } from '@clerk/nextjs/server';
export const redirectBasedOnRole = (user: UserResource | User) => {
  const router = useRouter();
  if (user?.publicMetadata.role === 'therapist') {
    router.push('/therapist');
  } else if (user?.publicMetadata.role === 'employer_admin') {
    router.push('/employer');
  } else {
    router.push('/employee');
  }
};
