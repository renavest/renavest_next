import { InferSelectModel } from 'drizzle-orm';
import * as schema from './schema';

export type Therapist = InferSelectModel<typeof schema.therapists>;
export type User = InferSelectModel<typeof schema.users>;
export type UserOnboarding = InferSelectModel<typeof schema.userOnboarding>;
