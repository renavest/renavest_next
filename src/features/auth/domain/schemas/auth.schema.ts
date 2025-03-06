import { z } from 'zod';

export const emailSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .regex(
      /@[\w-]+\.com$/,
      'Email must be a company email ending with .com'
    )
});

export const verificationCodeSchema = z.object({
  code: z
    .string()
    .length(4, 'Verification code must be exactly 4 digits')
    .regex(/^\d+$/, 'Code must contain only numbers')
});

export const loginSchema = emailSchema.merge(verificationCodeSchema);

export type LoginSchema = z.infer<typeof loginSchema>;
export type EmailSchema = z.infer<typeof emailSchema>;
export type VerificationCodeSchema = z.infer<typeof verificationCodeSchema>;