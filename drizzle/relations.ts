import { relations } from "drizzle-orm/relations";
import { therapists, therapistDocuments, employers, sponsoredGroups, sponsoredGroupMembers, users, therapistDocumentAssignments, therapistAvailability, therapistBlockedTimes, bookingSessions, userOnboarding, therapistChatPreferences, intakeForms, clientNotes, formAssignments, sessionPayments, employerSubsidies, stripeCustomers, therapistPayouts, chatChannels, chatMessages } from "./schema";

export const therapistDocumentsRelations = relations(therapistDocuments, ({one, many}) => ({
	therapist: one(therapists, {
		fields: [therapistDocuments.therapistId],
		references: [therapists.id]
	}),
	therapistDocumentAssignments: many(therapistDocumentAssignments),
}));

export const therapistsRelations = relations(therapists, ({one, many}) => ({
	therapistDocuments: many(therapistDocuments),
	user: one(users, {
		fields: [therapists.userId],
		references: [users.id]
	}),
	therapistAvailabilities: many(therapistAvailability),
	therapistBlockedTimes: many(therapistBlockedTimes),
	bookingSessions: many(bookingSessions),
	therapistChatPreferences: many(therapistChatPreferences),
	intakeForms: many(intakeForms),
	clientNotes: many(clientNotes),
	formAssignments: many(formAssignments),
	therapistPayouts: many(therapistPayouts),
	chatChannels: many(chatChannels),
}));

export const sponsoredGroupsRelations = relations(sponsoredGroups, ({one, many}) => ({
	employer: one(employers, {
		fields: [sponsoredGroups.employerId],
		references: [employers.id]
	}),
	sponsoredGroupMembers: many(sponsoredGroupMembers),
	bookingSessions: many(bookingSessions),
}));

export const employersRelations = relations(employers, ({many}) => ({
	sponsoredGroups: many(sponsoredGroups),
	users: many(users),
	employerSubsidies: many(employerSubsidies),
}));

export const sponsoredGroupMembersRelations = relations(sponsoredGroupMembers, ({one}) => ({
	sponsoredGroup: one(sponsoredGroups, {
		fields: [sponsoredGroupMembers.groupId],
		references: [sponsoredGroups.id]
	}),
	user: one(users, {
		fields: [sponsoredGroupMembers.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({one, many}) => ({
	sponsoredGroupMembers: many(sponsoredGroupMembers),
	therapistDocumentAssignments: many(therapistDocumentAssignments),
	employer: one(employers, {
		fields: [users.employerId],
		references: [employers.id]
	}),
	therapists: many(therapists),
	bookingSessions: many(bookingSessions),
	userOnboardings: many(userOnboarding),
	clientNotes: many(clientNotes),
	formAssignments: many(formAssignments),
	sessionPayments: many(sessionPayments),
	employerSubsidies: many(employerSubsidies),
	stripeCustomers: many(stripeCustomers),
	chatChannels: many(chatChannels),
	chatMessages: many(chatMessages),
}));

export const therapistDocumentAssignmentsRelations = relations(therapistDocumentAssignments, ({one}) => ({
	user: one(users, {
		fields: [therapistDocumentAssignments.userId],
		references: [users.id]
	}),
	therapistDocument: one(therapistDocuments, {
		fields: [therapistDocumentAssignments.documentId],
		references: [therapistDocuments.id]
	}),
}));

export const therapistAvailabilityRelations = relations(therapistAvailability, ({one}) => ({
	therapist: one(therapists, {
		fields: [therapistAvailability.therapistId],
		references: [therapists.id]
	}),
}));

export const therapistBlockedTimesRelations = relations(therapistBlockedTimes, ({one}) => ({
	therapist: one(therapists, {
		fields: [therapistBlockedTimes.therapistId],
		references: [therapists.id]
	}),
}));

export const bookingSessionsRelations = relations(bookingSessions, ({one, many}) => ({
	user: one(users, {
		fields: [bookingSessions.userId],
		references: [users.id]
	}),
	therapist: one(therapists, {
		fields: [bookingSessions.therapistId],
		references: [therapists.id]
	}),
	sponsoredGroup: one(sponsoredGroups, {
		fields: [bookingSessions.sponsoringGroupId],
		references: [sponsoredGroups.id]
	}),
	clientNotes: many(clientNotes),
	sessionPayments: many(sessionPayments),
	therapistPayouts: many(therapistPayouts),
}));

export const userOnboardingRelations = relations(userOnboarding, ({one}) => ({
	user: one(users, {
		fields: [userOnboarding.userId],
		references: [users.id]
	}),
}));

export const therapistChatPreferencesRelations = relations(therapistChatPreferences, ({one}) => ({
	therapist: one(therapists, {
		fields: [therapistChatPreferences.therapistId],
		references: [therapists.id]
	}),
}));

export const intakeFormsRelations = relations(intakeForms, ({one, many}) => ({
	therapist: one(therapists, {
		fields: [intakeForms.therapistId],
		references: [therapists.id]
	}),
	formAssignments: many(formAssignments),
}));

export const clientNotesRelations = relations(clientNotes, ({one}) => ({
	user: one(users, {
		fields: [clientNotes.userId],
		references: [users.id]
	}),
	therapist: one(therapists, {
		fields: [clientNotes.therapistId],
		references: [therapists.id]
	}),
	bookingSession: one(bookingSessions, {
		fields: [clientNotes.sessionId],
		references: [bookingSessions.id]
	}),
}));

export const formAssignmentsRelations = relations(formAssignments, ({one}) => ({
	intakeForm: one(intakeForms, {
		fields: [formAssignments.formId],
		references: [intakeForms.id]
	}),
	user: one(users, {
		fields: [formAssignments.clientId],
		references: [users.id]
	}),
	therapist: one(therapists, {
		fields: [formAssignments.therapistId],
		references: [therapists.id]
	}),
}));

export const sessionPaymentsRelations = relations(sessionPayments, ({one}) => ({
	bookingSession: one(bookingSessions, {
		fields: [sessionPayments.bookingSessionId],
		references: [bookingSessions.id]
	}),
	user: one(users, {
		fields: [sessionPayments.userId],
		references: [users.id]
	}),
}));

export const employerSubsidiesRelations = relations(employerSubsidies, ({one}) => ({
	employer: one(employers, {
		fields: [employerSubsidies.employerId],
		references: [employers.id]
	}),
	user: one(users, {
		fields: [employerSubsidies.userId],
		references: [users.id]
	}),
}));

export const stripeCustomersRelations = relations(stripeCustomers, ({one}) => ({
	user: one(users, {
		fields: [stripeCustomers.userId],
		references: [users.id]
	}),
}));

export const therapistPayoutsRelations = relations(therapistPayouts, ({one}) => ({
	therapist: one(therapists, {
		fields: [therapistPayouts.therapistId],
		references: [therapists.id]
	}),
	bookingSession: one(bookingSessions, {
		fields: [therapistPayouts.bookingSessionId],
		references: [bookingSessions.id]
	}),
}));

export const chatChannelsRelations = relations(chatChannels, ({one, many}) => ({
	therapist: one(therapists, {
		fields: [chatChannels.therapistId],
		references: [therapists.id]
	}),
	user: one(users, {
		fields: [chatChannels.prospectUserId],
		references: [users.id]
	}),
	chatMessages: many(chatMessages),
}));

export const chatMessagesRelations = relations(chatMessages, ({one}) => ({
	chatChannel: one(chatChannels, {
		fields: [chatMessages.channelId],
		references: [chatChannels.id]
	}),
	user: one(users, {
		fields: [chatMessages.senderId],
		references: [users.id]
	}),
}));