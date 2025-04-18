// Type definitions for user and therapist
export type UserType = {
  id: number;
  clerkId: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  isActive: boolean;
  therapistId: number | null;
  createdAt: Date;
  updatedAt: Date;
};

export type TherapistType = {
  id: number;
  userId: number | null;
  name: string;
  email: string | null;
  googleCalendarAccessToken: string | null;
  googleCalendarRefreshToken: string | null;
  googleCalendarEmail: string | null;
};
