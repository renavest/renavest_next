import { NextResponse } from 'next/server';

// Temporarily disabled Clerk authentication for demo
export default function middleware() {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
