"use client";
import React from "react";
import { useStore } from "@nanostores/react";
import { $auth, updateEmail, updateCode } from "../stores";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  loginSchema,
  validateCompanyEmail,
  validateCode,
} from "../utils/validation";
import { z } from "zod";
import VerificationCode from "./VerificationCode";

export default function LoginForm() {
  const auth = useStore($auth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted", { email: auth.email, code: auth.code });

    try {
      loginSchema.parse(auth);
      console.log("Zod validation passed");

      if (!validateCompanyEmail(auth.email)) {
        console.log("Invalid company email");
        toast.error("Please use your company email address", {
          description: "Need access? Schedule a demo with our team",
        });
        return;
      }
      if (!validateCode(auth.code)) {
        console.log("Invalid code");
        toast.error("Please enter the correct verification code", {
          description: "Need access? Schedule a demo with our team",
        });
        return;
      }
      console.log("Proceeding with login");
      window.location.href = "/";
    } catch (err) {
      console.error("Validation error:", err);
      if (err instanceof z.ZodError) {
        toast.error(err.errors[0].message);
      }
    }
  };

  const handleEmailChange = (value: string) => {
    updateEmail(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 p-8 shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back to <span className="text-[#875cf3]">Renavest</span>
          </h1>
          <p className="mt-2 text-muted-foreground">Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Work email</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border bg-background"
              value={auth.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              placeholder="you@companyemail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Verification code
            </label>
            <VerificationCode value={auth.code} onChange={updateCode} />
          </div>

          {auth.error && (
            <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              <span>{auth.error}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-primary text-primary-foreground h-11 px-4 rounded-lg font-medium"
            disabled={auth.isLoading}
          >
            {auth.isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          New to Renavest?{" "}
          <a href="/demo" className="font-medium text-primary hover:underline">
            Schedule a demo
          </a>
        </p>
      </div>
    </div>
  );
}
