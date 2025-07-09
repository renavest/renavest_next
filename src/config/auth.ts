// src/config/auth.ts
// Authentication and authorization configuration

// List of email addresses for internal staff/salespeople who can access the demo
export const ALLOWED_EMAILS = [
  'test@renavest.com',
  'admin@renavest.com',
  'sethmorton05@gmail.com',
  'stanley@renavestapp.com',
  'seth@renavestapp.com',
  'smphotography39@gmail.com',
  'rameau.stan@gmail.com',
  'info@sofenomenal.com',
] as const;

// Employer Email Domain/Email to Name Mapping
// This map helps you find the employer in your DB based on the user's email.
// Keys can be full emails or domain names.
// The value should correspond to the `name` field in your `employers` table.
export const EMPLOYER_EMAIL_MAP: { [emailOrDomain: string]: string } = {
  'acmecorp.com': 'Acme Corp', // Map domain to employer name
  'globex.com': 'Globex Corporation',
  'anotheremployee@specificcompany.com': 'Specific Company Inc.', // Map specific email
};

// List of email addresses authorized to be employer_admin
export const ALLOWED_EMPLOYER_ADMIN_EMAILS = [
  'admin@acmecorp.com',
  'hr@acmecorp.com',
  'admin@globex.com',
  'hr@globex.com',
  'seth@renavestapp.com', // For testing
  'stanley@renavestapp.com', // For testing
  'smphotography39@gmail.com',
  'rameau.stan@gmail.com',
] as const;

// User roles
export const USER_ROLES = [
  'individual_consumer',
  'employee',
  'therapist',
  'employer_admin',
] as const;

// Role-based route mappings
export const ROLE_ROUTES = {
  individual_consumer: '/dashboard',
  employee: '/employee-dashboard',
  therapist: '/therapist-dashboard',
  employer_admin: '/employer-dashboard',
} as const;

// Protected routes that require authentication
export const PROTECTED_ROUTES = [
  '/dashboard',
  '/employee-dashboard',
  '/therapist-dashboard',
  '/employer-dashboard',
  '/sessions',
  '/billing',
  '/chat',
] as const;

// Public routes that don't require authentication
export const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/pricing',
  '/about',
  '/contact',
  '/explore',
] as const;

// Type exports
export type UserRole = typeof USER_ROLES[number];
export type AllowedEmail = typeof ALLOWED_EMAILS[number];
export type EmployerAdminEmail = typeof ALLOWED_EMPLOYER_ADMIN_EMAILS[number];