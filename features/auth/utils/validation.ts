import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .regex(/@[\w-]+\.com$/),
  code: z.string().length(4).regex(/^\d+$/),
});

export function validateCompanyEmail(email: string): boolean {
  return email.endsWith("@companyemail.com");
}

export function validateCode(code: string): boolean {
  return code === "0000";
}
