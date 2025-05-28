export interface TherapistProfile {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
    imageUrl?: string;
  };
  therapist: {
    name?: string;
    title?: string;
    bookingURL?: string;
    expertise?: string;
    certifications?: string;
    song?: string;
    yoe?: number;
    clientele?: string;
    longBio?: string;
    previewBlurb?: string;
    profileUrl?: string;
    hourlyRate?: string;
    hourlyRateCents?: number;
    updatedAt?: string;
  };
}

export interface ProfileFormData {
  name?: string;
  title?: string;
  email?: string;
  yoe?: number;
  hourlyRate?: string;
  hourlyRateCents?: number;
  expertise?: string;
  certifications?: string;
  clientele?: string;
  longBio?: string;
  bookingURL?: string;
  firstName?: string;
  lastName?: string;
  profileUrl?: string;
}

export interface ProfileState {
  profile: TherapistProfile | null;
  loading: boolean;
  saving: boolean;
  saveSuccess: boolean;
  error: string | null;
  isModalOpen: boolean;
}
