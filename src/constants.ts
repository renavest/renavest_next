// src/constants.ts

// List of email addresses allowed for employee signup via the /login route
export const ALLOWED_EMPLOYEE_SIGNUP_EMAILS = [
  'employee1@example.com',
  'employee2@example.com',
  'sethmorton05@gmail.com', // Keep for testing if needed
  'alice@acmecorp.com', // Example for Acme Corp
  'bob@acmecorp.com',
  'charlie@globex.com', // Example for Globex Corp
  'seth@renavestapp.com',
  // Add other allowed employee emails here
];

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
];

// --- NEW: Employer Email Domain/Email to Name Mapping ---
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
];
