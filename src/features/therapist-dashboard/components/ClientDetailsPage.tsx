'use client';

import { useState, useEffect } from 'react';

import { fetchClientDetails } from '../actions/serverActions';

// Define more specific types for client data
type ClientDetails = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

type ClientNote = {
  id: number;
  title: string;
  content: {
    keyObservations?: string[];
    progressNotes?: string[];
    actionItems?: string[];
    emotionalState?: string;
    additionalContext?: string;
  } | null;
  createdAt: string;
  isConfidential: boolean;
};

type UpcomingSession = {
  id: number;
  sessionDate: string;
  sessionStartTime: string;
};

type ClientData = {
  clientDetails: ClientDetails;
  recentNotes: ClientNote[];
  upcomingSessions: UpcomingSession[];
};

type ClientDetailsProps = {
  clientId: string;
};

function ClientHeader({ firstName, lastName, email }: ClientDetails) {
  return (
    <div className='bg-white shadow rounded-lg p-6'>
      <h1 className='text-3xl font-bold mb-4'>
        {firstName} {lastName}
      </h1>
      <p className='text-gray-600'>Email: {email}</p>
    </div>
  );
}

function RecentNotesList({ notes }: { notes: ClientNote[] }) {
  if (notes.length === 0) {
    return <p>No recent notes.</p>;
  }

  return (
    <ul className='space-y-4'>
      {notes.map((note) => (
        <li key={note.id} className='border-b pb-4 last:border-b-0'>
          <h3 className='font-medium'>{note.title}</h3>
          <p className='text-gray-600 text-sm'>
            Created: {new Date(note.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

function UpcomingSessionsList({ sessions }: { sessions: UpcomingSession[] }) {
  if (sessions.length === 0) {
    return <p>No upcoming sessions.</p>;
  }

  return (
    <ul className='space-y-4'>
      {sessions.map((session) => (
        <li key={session.id} className='border-b pb-4 last:border-b-0'>
          <p className='font-medium'>{new Date(session.sessionDate).toLocaleDateString()}</p>
          <p className='text-gray-600 text-sm'>
            {new Date(session.sessionStartTime).toLocaleTimeString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

export function ClientDetailsPage({ clientId }: ClientDetailsProps) {
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClientDetails() {
      try {
        setIsLoading(true);
        const fetchedClientData = await fetchClientDetails(clientId);

        const transformedClientData: ClientData = {
          clientDetails: {
            id: fetchedClientData.clientDetails.id,
            firstName: fetchedClientData.clientDetails.firstName ?? '',
            lastName: fetchedClientData.clientDetails.lastName ?? '',
            email: fetchedClientData.clientDetails.email,
          },
          recentNotes: fetchedClientData.recentNotes.map((note) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: note.createdAt ? note.createdAt.toISOString() : new Date().toISOString(),
            isConfidential: note.isConfidential ?? false,
          })),
          upcomingSessions: fetchedClientData.upcomingSessions.map((session) => ({
            id: session.id,
            sessionDate: session.sessionDate
              ? session.sessionDate.toISOString()
              : new Date().toISOString(),
            sessionStartTime: session.sessionStartTime
              ? session.sessionStartTime.toISOString()
              : new Date().toISOString(),
          })),
        };

        setClientData(transformedClientData);
      } catch (err) {
        setError('Failed to load client details');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadClientDetails();
  }, [clientId]);

  if (isLoading) {
    return <div className='text-center'>Loading client details...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  if (!clientData) {
    return <div>No client data found.</div>;
  }

  const { clientDetails, recentNotes, upcomingSessions } = clientData;

  return (
    <div className='space-y-6 p-6'>
      <ClientHeader {...clientDetails} />

      <div className='grid md:grid-cols-2 gap-6'>
        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-4'>Recent Notes</h2>
          <RecentNotesList notes={recentNotes} />
        </div>

        <div className='bg-white shadow rounded-lg p-6'>
          <h2 className='text-2xl font-semibold mb-4'>Upcoming Sessions</h2>
          <UpcomingSessionsList sessions={upcomingSessions} />
        </div>
      </div>
    </div>
  );
}
