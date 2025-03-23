import { relations } from 'drizzle-orm/relations';

import { users, therapists } from './schema';

export const therapistsRelations = relations(therapists, ({ one }) => ({
  user: one(users, {
    fields: [therapists.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  therapists: many(therapists),
}));
