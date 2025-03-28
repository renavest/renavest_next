import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  boolean,
  jsonb,
} from 'drizzle-orm/pg-core';

// Users table (connected to Clerk)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Onboarding table with flexible JSON storage
export const userOnboarding = pgTable('user_onboarding', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id)
    .notNull(),
  answers: jsonb('answers'), // Flexible JSON storage for onboarding answers
  version: integer('version').notNull().default(1), // Track onboarding form version
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Therapists table with optional user relationship
export const therapists = pgTable('therapists', {
  id: serial('id').primaryKey(),
  // Optional reference to a user (can be null for manually managed therapists)
  userId: integer('user_id').references(() => users.id),
  name: varchar('name', { length: 255 }).notNull(),
  title: varchar('title', { length: 255 }),
  bookingURL: text('booking_url'),
  expertise: text('expertise'),
  certifications: text('certifications'),
  song: text('favorite_song'),
  yoe: integer('years_of_experience'),
  clientele: text('ideal_clientele'),
  longBio: text('long_bio'),
  previewBlurb: text('preview_blurb'),
  profileUrl: text('profile_image_url'),
  hourlyRate: numeric('hourly_rate', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
