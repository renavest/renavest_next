import { useCallback } from 'react';
import { toast } from 'sonner';

import {
  therapistIdSignal,
  clientsSignal,
  upcomingSessionsSignal,
  statisticsSignal,
  clientNotesSignal,
  selectedClientSignal,
  clientNotesLoadingSignal,
  addClientSubmittingSignal,
  addClientFormDataSignal,
  isAddClientOpenSignal,
} from '../state/therapistDashboardState';
import { CreateNoteRequest } from '../types';

// Type definition for API session response
interface ApiSession {
  id: number;
  clientId?: number;
  clientName: string;
  sessionDate: string;
  sessionStartTime: string;
  status: string;
  googleMeetLink?: string;
  therapistTimezone?: string;
  clientTimezone?: string;
}

// Dashboard data refresh using API calls
const refreshDashboardData = async (therapistId: number | null) => {
  if (!therapistId) return;

  try {
    const [clientsResponse, sessionsResponse, statsResponse] = await Promise.all([
      fetch('/api/therapist/clients'),
      fetch('/api/therapist/sessions'),
      fetch('/api/therapist/statistics'),
    ]);

    if (clientsResponse.ok && sessionsResponse.ok && statsResponse.ok) {
      const [clientsData, sessionsData, statsData] = await Promise.all([
        clientsResponse.json(),
        sessionsResponse.json(),
        statsResponse.json(),
      ]);

      clientsSignal.value = clientsData.clients || [];
      upcomingSessionsSignal.value = (sessionsData.sessions || []).map((session: ApiSession) => ({
        id: session.id.toString(),
        clientId: session.clientId?.toString() ?? '',
        clientName: session.clientName,
        sessionDate: session.sessionDate,
        sessionStartTime: session.sessionStartTime,
        therapistTimezone: session.therapistTimezone,
        clientTimezone: session.clientTimezone,
        duration: 60,
        sessionType: 'follow-up' as const,
        status: session.status as 'scheduled' | 'confirmed' | 'pending',
        googleMeetLink: session.googleMeetLink,
      }));
      statisticsSignal.value = statsData.statistics || {
        totalClients: 0,
        activeClients: 0,
        totalSessions: 0,
        upcomingSessions: 0,
        totalRevenue: 0,
        monthlyRevenue: 0,
        completionRate: 0,
      };
    }
  } catch (error) {
    console.error('Error refreshing dashboard:', error);
  }
};

// Add new client with immediate UI update
const addClientAction = async (
  clientData: { firstName: string; lastName: string; email: string },
  therapistId: number | null,
) => {
  if (!therapistId) return { success: false, error: 'No therapist ID' };

  try {
    addClientSubmittingSignal.value = true;

    const response = await fetch('/api/therapist/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData),
    });

    if (!response.ok) {
      throw new Error('Failed to add client');
    }

    const result = await response.json();

    // Immediate UI feedback
    toast.success(`Client ${clientData.firstName} ${clientData.lastName} added successfully!`);

    // Optimistic UI update - add client to the list immediately
    const newClient = {
      id: result.client?.id?.toString() || Date.now().toString(),
      firstName: clientData.firstName,
      lastName: clientData.lastName,
      email: clientData.email,
      phone: undefined,
      createdAt: new Date().toISOString(),
      lastSessionDate: undefined,
      totalSessions: 0,
      status: 'active' as const,
    };

    clientsSignal.value = [newClient, ...clientsSignal.value];

    // Update statistics immediately
    statisticsSignal.value = {
      ...statisticsSignal.value,
      totalClients: statisticsSignal.value.totalClients + 1,
      activeClients: statisticsSignal.value.activeClients + 1,
    };

    // Clear form and close modal
    addClientFormDataSignal.value = { firstName: '', lastName: '', email: '' };
    isAddClientOpenSignal.value = false;

    // Refresh data in background
    await refreshDashboardData(therapistId);

    return { success: true };
  } catch (error) {
    toast.error('Failed to add client');
    console.error('Error adding client:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  } finally {
    addClientSubmittingSignal.value = false;
  }
};

// Add new note with immediate UI update
const addNoteAction = async (noteData: CreateNoteRequest, therapistId: number | null) => {
  if (!therapistId) return { success: false, error: 'No therapist ID' };

  try {
    const response = await fetch('/api/therapist/notes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to save note');
    }

    const result = await response.json();

    // Immediate UI feedback
    toast.success('Note saved successfully!');

    // Optimistic UI update - add note to the list immediately
    const newNote = {
      id: result.note?.id || Date.now(),
      userId: noteData.userId,
      therapistId: therapistId,
      sessionId: noteData.sessionId,
      title: noteData.title,
      content: noteData.content,
      isConfidential: noteData.isConfidential || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to beginning of notes list
    clientNotesSignal.value = [newNote, ...clientNotesSignal.value];

    // Refresh notes for the current client using API
    if (selectedClientSignal.value) {
      try {
        clientNotesLoadingSignal.value = true;
        const notesResponse = await fetch(
          `/api/therapist/notes?clientId=${selectedClientSignal.value.id}`,
        );
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          clientNotesSignal.value = notesData.notes || [];
        }
      } catch (error) {
        console.error('Error refreshing notes after add:', error);
      } finally {
        clientNotesLoadingSignal.value = false;
      }
    }

    return { success: true };
  } catch (error) {
    toast.error('Failed to save note');
    console.error('Error saving note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Schedule new session with immediate UI update
const scheduleSessionAction = async (
  sessionData: {
    clientId: string;
    sessionDate: string;
    sessionTime: string;
    duration?: number;
    notes?: string;
  },
  therapistId: number | null,
) => {
  if (!therapistId) return { success: false, error: 'No therapist ID' };

  try {
    const response = await fetch('/api/therapist/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...sessionData,
        therapistId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to schedule session');
    }

    const result = await response.json();

    // Immediate UI feedback
    const client = clientsSignal.value.find((c) => c.id === sessionData.clientId);
    toast.success(`Session scheduled with ${client?.firstName} ${client?.lastName}!`);

    // Optimistic UI update - add session to the list immediately
    const newSession = {
      id: result.session?.id?.toString() || Date.now().toString(),
      clientId: sessionData.clientId,
      clientName: client ? `${client.firstName} ${client.lastName}` : 'Unknown Client',
      sessionDate: sessionData.sessionDate,
      sessionStartTime: `${sessionData.sessionDate}T${sessionData.sessionTime}`,
      therapistTimezone: 'America/New_York',
      clientTimezone: 'America/New_York',
      duration: sessionData.duration || 60,
      sessionType: 'follow-up' as const,
      status: 'scheduled' as const,
      googleMeetLink: undefined,
      notes: sessionData.notes,
    };

    // Add to sessions list and sort by date
    const updatedSessions = [...upcomingSessionsSignal.value, newSession].sort(
      (a, b) => new Date(a.sessionDate).getTime() - new Date(b.sessionDate).getTime(),
    );

    upcomingSessionsSignal.value = updatedSessions;

    // Update statistics immediately
    statisticsSignal.value = {
      ...statisticsSignal.value,
      upcomingSessions: statisticsSignal.value.upcomingSessions + 1,
      totalSessions: statisticsSignal.value.totalSessions + 1,
    };

    // Refresh data in background
    await refreshDashboardData(therapistId);

    return { success: true };
  } catch (error) {
    toast.error('Failed to schedule session');
    console.error('Error scheduling session:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Update note with immediate UI update
const updateNoteAction = async (
  noteId: number,
  noteData: Partial<CreateNoteRequest>,
  therapistId: number | null,
) => {
  if (!therapistId) return { success: false, error: 'No therapist ID' };

  try {
    const response = await fetch(`/api/therapist/notes/${noteId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(noteData),
    });

    if (!response.ok) {
      throw new Error('Failed to update note');
    }

    // Immediate UI feedback
    toast.success('Note updated successfully!');

    // Optimistic UI update
    clientNotesSignal.value = clientNotesSignal.value.map((note) =>
      note.id === noteId
        ? {
            ...note,
            ...noteData,
            updatedAt: new Date().toISOString(),
          }
        : note,
    );

    // Refresh notes for the current client using API
    if (selectedClientSignal.value) {
      try {
        clientNotesLoadingSignal.value = true;
        const notesResponse = await fetch(
          `/api/therapist/notes?clientId=${selectedClientSignal.value.id}`,
        );
        if (notesResponse.ok) {
          const notesData = await notesResponse.json();
          clientNotesSignal.value = notesData.notes || [];
        }
      } catch (error) {
        console.error('Error refreshing notes after update:', error);
      } finally {
        clientNotesLoadingSignal.value = false;
      }
    }

    return { success: true };
  } catch (error) {
    toast.error('Failed to update note');
    console.error('Error updating note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Delete note with immediate UI update
const deleteNoteAction = async (noteId: number, therapistId: number | null) => {
  if (!therapistId) return { success: false, error: 'No therapist ID' };

  try {
    const response = await fetch(`/api/therapist/notes/${noteId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }

    // Immediate UI feedback
    toast.success('Note deleted successfully!');

    // Optimistic UI update
    clientNotesSignal.value = clientNotesSignal.value.filter((note) => note.id !== noteId);

    return { success: true };
  } catch (error) {
    toast.error('Failed to delete note');
    console.error('Error deleting note:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export function useTherapistActions() {
  const therapistId = therapistIdSignal.value;

  const refreshData = useCallback(() => refreshDashboardData(therapistId), [therapistId]);

  const addClient = useCallback(
    (clientData: { firstName: string; lastName: string; email: string }) =>
      addClientAction(clientData, therapistId),
    [therapistId],
  );

  const addNote = useCallback(
    (noteData: CreateNoteRequest) => addNoteAction(noteData, therapistId),
    [therapistId],
  );

  const updateNote = useCallback(
    (noteId: number, noteData: Partial<CreateNoteRequest>) =>
      updateNoteAction(noteId, noteData, therapistId),
    [therapistId],
  );

  const deleteNote = useCallback(
    (noteId: number) => deleteNoteAction(noteId, therapistId),
    [therapistId],
  );

  const scheduleSession = useCallback(
    (sessionData: {
      clientId: string;
      sessionDate: string;
      sessionTime: string;
      duration?: number;
      notes?: string;
    }) => scheduleSessionAction(sessionData, therapistId),
    [therapistId],
  );

  return {
    addClient,
    addNote,
    updateNote,
    deleteNote,
    scheduleSession,
    refreshDashboardData: refreshData,
  };
}
