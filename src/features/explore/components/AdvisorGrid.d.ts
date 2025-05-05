import { InferSelectModel } from 'drizzle-orm';

import therapists from '../../../db/schema';

export interface Advisor extends InferSelectModel<typeof therapists> {
  hasProfileImage?: boolean;
}

export interface AdvisorGridProps {
  advisors: Advisor[];
}

declare const AdvisorGrid: React.ComponentType<AdvisorGridProps>;

export default AdvisorGrid;
