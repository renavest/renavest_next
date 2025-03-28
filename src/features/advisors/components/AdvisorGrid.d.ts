import { InferSelectModel } from 'drizzle-orm';

import { therapists } from '../../../db/schema';

export type Advisor = InferSelectModel<typeof therapists>;

export interface AdvisorGridProps {
  advisors: Advisor[];
}

declare const AdvisorGrid: React.ComponentType<AdvisorGridProps>;

export default AdvisorGrid;
