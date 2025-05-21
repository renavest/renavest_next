export interface Advisor {
  id: string;
  name: string;
  title: string;
  bookingURL: string;
  expertise: string;
  certifications: string;
  song: string;
  yoe: string;
  clientele: string;
  longBio: string;
  previewBlurb: string;
  profileUrl?: string;
  introduction?: string;
  hourlyRate?: string;
}

export type UserRole = 'employee' | 'therapist' | 'super_admin' | 'employer_admin' | null;
