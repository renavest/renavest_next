'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

import { fetchTherapistClients } from '../actions/serverActions';

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
};

export function ClientList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadClients() {
      try {
        setIsLoading(true);
        const fetchedClients = await fetchTherapistClients();

        // Ensure type safety by mapping and providing default values
        const safeClients: Client[] = fetchedClients.map((client) => ({
          id: client.id ?? '',
          firstName: client.firstName ?? '',
          lastName: client.lastName ?? '',
          email: client.email ?? '',
        }));

        setClients(safeClients);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';

        setError(errorMessage);
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadClients();
  }, []);

  if (isLoading) {
    return <div className='text-center'>Loading clients...</div>;
  }

  if (error) {
    return <div className='text-red-500'>{error}</div>;
  }

  return (
    <div className='space-y-4'>
      <h2 className='text-2xl font-bold mb-4'>My Clients</h2>
      {clients.length === 0 ? (
        <p>No clients found.</p>
      ) : (
        <ul className='divide-y divide-gray-200'>
          {clients.map((client) => (
            <li key={client.id} className='py-4 hover:bg-gray-50 transition-colors'>
              <Link href={`/therapist-dashboard/client/${client.id}`} className='block'>
                <div className='flex justify-between items-center'>
                  <div>
                    <p className='text-lg font-semibold'>
                      {client.firstName} {client.lastName}
                    </p>
                    <p className='text-gray-500'>{client.email}</p>
                  </div>
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    className='h-6 w-6 text-gray-400'
                    fill='none'
                    viewBox='0 0 24 24'
                    stroke='currentColor'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M9 5l7 7-7 7'
                    />
                  </svg>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
