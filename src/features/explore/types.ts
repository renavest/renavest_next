// Explore Feature Types

export interface AdvisorCardProps {
  advisor: {
    id: string;
    name: string;
    title: string;
    profileUrl?: string;
    previewBlurb: string;
    expertise: string;
    yoe: string;
    hourlyRate?: string;
    isPending?: boolean;
  };
  onBookSession: (advisorId: string) => void;
  onViewProfile: (advisorId: string) => void;
}
