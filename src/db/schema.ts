import { relations } from 'drizzle-orm';
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

// Base table definitions without circular references
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: text('first_name'),
  lastName: text('last_name'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  therapistId: integer('therapist_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const therapists = pgTable('therapists', {
  id: serial('id').primaryKey(),
  userId: integer('user_id'),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }), // New email field
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
  // New fields for Google Calendar integration
  googleCalendarAccessToken: text('google_calendar_access_token'),
  googleCalendarRefreshToken: text('google_calendar_refresh_token'),
  googleCalendarEmail: text('google_calendar_email'),
  googleCalendarIntegrationStatus: varchar('google_calendar_integration_status', {
    length: 50,
    enum: ['not_connected', 'connected', 'error'],
  }).default('not_connected'),
  googleCalendarIntegrationDate: timestamp('google_calendar_integration_date'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Relationships defined separately to avoid circular references
export const usersRelations = relations(users, ({ one }) => ({
  /**
   * Establishes a many-to-one relationship between a user and their assigned therapist
   * Each user belongs to one therapist
   */
  therapist: one(therapists, {
    fields: [users.therapistId],
    references: [therapists.id],
  }),
}));

export const therapistsRelations = relations(therapists, ({ many }) => ({
  /**
   * Establishes a one-to-many relationship between a therapist and their clients
   * A therapist can have multiple users/clients
   */
  clients: many(users),
}));

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

// Add before the bookingSessions table
export const therapistAvailability = pgTable('therapist_availability', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id)
    .notNull(),
  dayOfWeek: integer('day_of_week').notNull(), // 0-6 for Sunday-Saturday
  startTime: varchar('start_time', { length: 5 }).notNull(), // Format: "HH:mm"
  endTime: varchar('end_time', { length: 5 }).notNull(), // Format: "HH:mm"
  isRecurring: boolean('is_recurring').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const therapistBlockedTimes = pgTable('therapist_blocked_times', {
  id: serial('id').primaryKey(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id)
    .notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  reason: text('reason'),
  googleEventId: text('google_event_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Enhance the bookingSessions table
export const bookingSessions = pgTable('booking_sessions', {
  id: serial('id').primaryKey(),
  userId: text('user_id')
    .references(() => users.clerkId)
    .notNull(),
  therapistId: integer('therapist_id')
    .references(() => therapists.id)
    .notNull(),
  sessionDate: timestamp('session_date').notNull(),
  sessionStartTime: timestamp('session_start_time').notNull(),
  sessionEndTime: timestamp('session_end_time').notNull(),
  status: varchar('status', {
    length: 50,
    enum: ['pending', 'confirmed', 'scheduled', 'completed', 'cancelled', 'rescheduled'],
  })
    .notNull()
    .default('pending'),
  googleEventId: text('google_event_id'),
  cancellationReason: text('cancellation_reason'),
  metadata: jsonb('metadata'), // Flexible JSON field for additional data
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const clientNotes = pgTable('client_notes', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull(), // Client's user ID
  therapistId: integer('therapist_id').notNull(), // Therapist who created the note
  sessionId: integer('session_id'), // Optional link to a specific session
  title: text('title').notNull(),
  content: jsonb('content').$type<{
    keyObservations?: string[];
    progressNotes?: string[];
    actionItems?: string[];
    emotionalState?: string;
    additionalContext?: string;
  }>(),
  isConfidential: boolean('is_confidential').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Additional relations
export const clientNotesRelations = relations(clientNotes, ({ one }) => ({
  user: one(users, {
    fields: [clientNotes.userId],
    references: [users.clerkId],
  }),
  therapist: one(therapists, {
    fields: [clientNotes.therapistId],
    references: [therapists.id],
  }),
  session: one(bookingSessions, {
    fields: [clientNotes.sessionId],
    references: [bookingSessions.id],
  }),
}));

// Add relations for the new tables
export const therapistAvailabilityRelations = relations(therapistAvailability, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistAvailability.therapistId],
    references: [therapists.id],
  }),
}));

export const therapistBlockedTimesRelations = relations(therapistBlockedTimes, ({ one }) => ({
  therapist: one(therapists, {
    fields: [therapistBlockedTimes.therapistId],
    references: [therapists.id],
  }),
}));
