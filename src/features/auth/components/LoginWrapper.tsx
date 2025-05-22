// src/app/(auth)/login/page.tsx
import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

import LoginPageContent from '@/src/features/auth/components/LoginPageContent';
import type { UserRole } from '@/src/shared/types';

export default async function LoginWrapper() {
  return <LoginPageContent />;
}
