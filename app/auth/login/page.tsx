"use client";
import { LoginForm } from "@/src/features/auth/login-form";
import { Toaster } from "@/components/ui/toaster";
export default function LoginPage() {
  return (
    <div className="flex items-center justify-center min-h-screen w-screen">
      <LoginForm />
      <Toaster />
    </div>
  );
}
