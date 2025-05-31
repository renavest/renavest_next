// Main exports for the therapist dashboard feature
export * from './types';
export * from './hooks';
export * from './utils';
export * from './state/therapistDashboardState';

// Component exports
export { default as TherapistDashboardClient } from './components/dashboard/TherapistDashboardClient';
export { default as TherapistNavbar } from './components/navigation/TherapistNavbar';
export { TherapistStatisticsCard } from './components/dashboard/TherapistStatisticsCard';
export { UpcomingSessionsCard } from './components/sessions/UpcomingSessionsCard';
export { AddNewClientSection } from './components/clients/AddNewClientSection';
export { ClientNotesSection } from './components/clients/ClientNotesSection';
export { TherapistImage } from './components/shared/TherapistImage';
export { AvailabilityManagement } from './components/availability-management/AvailabilityManagement';
