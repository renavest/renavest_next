'use client';

import { X, Search, Users, Eye, UserPlus, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

import { ClientInfo, TherapistDocument } from '../../types/documents';

interface ClientAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: TherapistDocument;
  onAssignmentUpdate: () => void;
}

// Helper component for the info banner
const InfoBanner = () => (
  <div className='px-6 py-4 bg-purple-50 border-b border-purple-100'>
    <div className='flex items-start gap-3'>
      <div className='w-5 h-5 bg-purple-200 rounded-full flex items-center justify-center mt-0.5'>
        <div className='w-2 h-2 bg-purple-600 rounded-full'></div>
      </div>
      <div className='text-sm'>
        <p className='text-purple-800 font-medium mb-1'>How document access works:</p>
        <ul className='text-purple-700 space-y-1'>
          <li>
            • <strong>Assign:</strong> Add document to your client's file (private to you)
          </li>
          <li>
            • <strong>Share:</strong> Make document visible to the client in their portal
          </li>
        </ul>
      </div>
    </div>
  </div>
);

// Helper component for client row
const ClientRow = ({
  client,
  document,
  isProcessing,
  onAssign,
  onUnassign,
  onToggleShare,
}: {
  client: ClientInfo;
  document: TherapistDocument;
  isProcessing: boolean;
  onAssign: (clientId: number) => void;
  onUnassign: (clientId: number) => void;
  onToggleShare: (clientId: number, currentlyShared: boolean) => void;
}) => {
  const assignedClientIds = new Set(document.assignments?.map((a) => a.userId) || []);
  const isAssigned = assignedClientIds.has(client.id);
  const assignment = document.assignments?.find((a) => a.userId === client.id);
  const isShared = assignment?.isSharedWithClient || false;

  return (
    <div className='p-4 hover:bg-gray-50 transition-colors'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center'>
            <span className='text-sm font-medium text-gray-600'>
              {client.fullName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className='font-medium text-gray-800'>{client.fullName}</p>
            <p className='text-sm text-gray-500'>{client.email}</p>
            {isAssigned && assignment && (
              <div className='flex items-center gap-2 mt-1'>
                <span className='text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full'>
                  Assigned {new Date(assignment.assignedAt).toLocaleDateString()}
                </span>
                {isShared && (
                  <span className='text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full'>
                    Shared with client
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        <div className='flex items-center gap-2'>
          {isAssigned ? (
            <>
              <button
                onClick={() => onToggleShare(client.id, isShared)}
                disabled={isProcessing}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isShared
                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-300'
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 border border-blue-300'
                } disabled:opacity-50`}
              >
                <div className='flex items-center gap-1'>
                  <Eye className='w-4 h-4' />
                  {isShared ? 'Shared with Client' : 'Share with Client'}
                </div>
              </button>
              <button
                onClick={() => onUnassign(client.id)}
                disabled={isProcessing}
                className='px-3 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium border border-red-300'
              >
                {isProcessing ? (
                  <div className='w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin'></div>
                ) : (
                  'Remove from File'
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => onAssign(client.id)}
              disabled={isProcessing}
              className='px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg transition-colors disabled:opacity-50 text-sm font-medium border border-purple-600'
            >
              {isProcessing ? (
                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
              ) : (
                <div className='flex items-center gap-1'>
                  <UserPlus className='w-4 h-4' />
                  Add to Client File
                </div>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Helper component for client list content
const ClientListContent = ({
  loading,
  filteredClients,
  searchTerm,
  document,
  assigningClients,
  onAssign,
  onUnassign,
  onToggleShare,
  onClearSearch,
}: {
  loading: boolean;
  filteredClients: ClientInfo[];
  searchTerm: string;
  document: TherapistDocument;
  assigningClients: Set<number>;
  onAssign: (clientId: number) => void;
  onUnassign: (clientId: number) => void;
  onToggleShare: (clientId: number, currentlyShared: boolean) => void;
  onClearSearch: () => void;
}) => {
  if (loading) {
    return (
      <div className='p-8 text-center'>
        <div className='animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4'></div>
        <p className='text-gray-500'>Loading clients...</p>
      </div>
    );
  }

  if (filteredClients.length === 0) {
    return (
      <div className='p-8 text-center'>
        <Users className='w-12 h-12 text-gray-300 mx-auto mb-4' />
        <p className='text-gray-500 mb-2'>
          {searchTerm ? 'No clients match your search' : 'No clients found'}
        </p>
        {searchTerm && (
          <button
            onClick={onClearSearch}
            className='text-purple-600 hover:text-purple-700 text-sm font-medium'
          >
            Clear search
          </button>
        )}
      </div>
    );
  }

  return (
    <div className='divide-y divide-gray-100'>
      {filteredClients.map((client) => (
        <ClientRow
          key={client.id}
          client={client}
          document={document}
          isProcessing={assigningClients.has(client.id)}
          onAssign={onAssign}
          onUnassign={onUnassign}
          onToggleShare={onToggleShare}
        />
      ))}
    </div>
  );
};

export function ClientAssignmentModal({
  isOpen,
  onClose,
  document,
  onAssignmentUpdate,
}: ClientAssignmentModalProps) {
  const [clients, setClients] = useState<ClientInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [assigningClients, setAssigningClients] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);

  // Filter clients based on search term
  const filteredClients = clients.filter(
    (client) =>
      client.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const fetchClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/therapist/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }

      const data = await response.json();
      setClients(data.clients || []);
    } catch (err) {
      console.error('Error fetching clients:', err);
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchClients();
    }
  }, [isOpen]);

  const handleAssignClient = async (clientId: number, shareWithClient: boolean = false) => {
    try {
      setAssigningClients((prev) => new Set(prev).add(clientId));
      setError(null);

      const response = await fetch('/api/therapist/documents/assign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          clientId,
          shareWithClient,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign document');
      }

      onAssignmentUpdate();
    } catch (err) {
      console.error('Error assigning document:', err);
      setError(err instanceof Error ? err.message : 'Failed to assign document');
    } finally {
      setAssigningClients((prev) => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  const handleUnassignClient = async (clientId: number) => {
    try {
      setAssigningClients((prev) => new Set(prev).add(clientId));
      setError(null);

      const response = await fetch('/api/therapist/documents/assign', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentId: document.id,
          clientId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to remove assignment');
      }

      onAssignmentUpdate();
    } catch (err) {
      console.error('Error removing assignment:', err);
      setError(err instanceof Error ? err.message : 'Failed to remove assignment');
    } finally {
      setAssigningClients((prev) => {
        const newSet = new Set(prev);
        newSet.delete(clientId);
        return newSet;
      });
    }
  };

  const handleToggleShare = async (clientId: number, currentlyShared: boolean) => {
    await handleAssignClient(clientId, !currentlyShared);
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden'>
        {/* Header */}
        <div className='p-6 border-b border-gray-200'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
                <FileText className='w-5 h-5 text-purple-600' />
              </div>
              <div>
                <h2 className='text-xl font-semibold text-gray-800'>Manage Document Access</h2>
                <p className='text-sm text-gray-600 truncate max-w-md'>{document.title}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>
        </div>

        <InfoBanner />

        {/* Search */}
        <div className='p-6 border-b border-gray-100'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
            <input
              type='text'
              placeholder='Search clients...'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
            <p className='text-red-600 text-sm'>{error}</p>
          </div>
        )}

        {/* Client List */}
        <div className='flex-1 overflow-y-auto max-h-96'>
          <ClientListContent
            loading={loading}
            filteredClients={filteredClients}
            searchTerm={searchTerm}
            document={document}
            assigningClients={assigningClients}
            onAssign={(clientId) => handleAssignClient(clientId, false)}
            onUnassign={handleUnassignClient}
            onToggleShare={handleToggleShare}
            onClearSearch={() => setSearchTerm('')}
          />
        </div>

        {/* Footer */}
        <div className='p-6 border-t border-gray-200 bg-gray-50'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-gray-600'>
              {document.assignments?.length || 0} client
              {(document.assignments?.length || 0) !== 1 ? 's' : ''} assigned •{' '}
              {document.assignments?.filter((a) => a.isSharedWithClient).length || 0} shared
            </div>
            <button
              onClick={onClose}
              className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
