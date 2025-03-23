import {
  pgTable,
  unique,
  serial,
  varchar,
  text,
  boolean,
  timestamp,
  foreignKey,
  integer,
  numeric,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: serial().primaryKey().notNull(),
    clerkId: varchar('clerk_id', { length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    firstName: text('first_name'),
    lastName: text('last_name'),
    imageUrl: text('image_url'),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    unique('users_clerk_id_unique').on(table.clerkId),
    unique('users_email_unique').on(table.email),
  ],
);

export const therapists = pgTable(
  'therapists',
  {
    id: serial().primaryKey().notNull(),
    userId: integer('user_id'),
    name: varchar({ length: 255 }).notNull(),
    title: varchar({ length: 255 }),
    bookingUrl: text('booking_url'),
    expertise: text(),
    certifications: text(),
    favoriteSong: text('favorite_song'),
    yearsOfExperience: integer('years_of_experience'),
    idealClientele: text('ideal_clientele'),
    longBio: text('long_bio'),
    previewBlurb: text('preview_blurb'),
    profileImageUrl: text('profile_image_url'),
    hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
    createdAt: timestamp('created_at', { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { mode: 'string' }).defaultNow().notNull(),
  },
  (table) => [
    foreignKey({
      columns: [table.userId],
      foreignColumns: [users.id],
      name: 'therapists_user_id_users_id_fk',
    }),
  ],
);
