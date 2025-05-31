'use client';

import { FileText, Download, Eye, Calendar, Share2, Folder } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Client } from '../../types';
import { DOCUMENT_CATEGORY_LABELS, FILE_TYPE_LABELS } from '../../types/documents';

interface ClientDocument {
  id: number;
  title: string;
  description?: string;
  category: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  s3Key: string;
  assignedAt: string;
  isSharedWithClient: boolean;
  sharedAt?: string;
}

interface ClientDocumentsTabProps {
  client: Client;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function to format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Helper function to get file icon
const getFileIcon = (mimeType: string) => {
  if (mimeType.startsWith('image/')) {
    return '🖼️';
  } else if (mimeType === 'application/pdf') {
    return '📄';
  } else if (mimeType.includes('word')) {
    return '📝';
  } else if (mimeType === 'text/plain') {
    return '📃';
  }
  return '📄';
};

// Helper function to download document
const downloadDocument = async (document: ClientDocument): Promise<void> => {
  try {
    const response = await fetch(
      `/api/therapist/documents/download?s3Key=${encodeURIComponent(document.s3Key)}`,
    );

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    const data = await response.json();
    window.open(data.downloadUrl, '_blank');
  } catch (error) {
    console.error('Error downloading document:', error);
    alert('Failed to download document. Please try again.');
  }
};

export function ClientDocumentsTab({ client }: ClientDocumentsTabProps) {
  const [documents, setDocuments] = useState<ClientDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClientDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/therapist/clients/${client.id}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch client documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching client documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientDocuments();
  }, [client.id]);

  if (loading) {
    return (
      <div className='p-8 text-center'>
        <div className='animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4'></div>
        <p className='text-gray-500'>Loading documents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-8 text-center'>
        <div className='w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4'>
          <FileText className='w-6 h-6 text-red-600' />
        </div>
        <p className='text-red-600 mb-2'>Error loading documents</p>
        <p className='text-gray-500 text-sm mb-4'>{error}</p>
        <button
          onClick={fetchClientDocuments}
          className='px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors'
        >
          Try Again
        </button>
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className='p-8 text-center'>
        <div className='w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6'>
          <Folder className='w-8 h-8 text-gray-400' />
        </div>
        <h3 className='text-lg font-semibold text-gray-800 mb-2'>No Documents Assigned</h3>
        <p className='text-gray-500 mb-4'>
          No documents have been assigned to {client.firstName} yet.
        </p>
        <p className='text-sm text-gray-400'>
          Assign documents from the Documents section to share resources with this client.
        </p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h3 className='text-xl font-semibold text-gray-900'>Assigned Documents</h3>
          <p className='text-gray-600'>
            Documents assigned to {client.firstName} {client.lastName}
          </p>
        </div>
        <div className='text-sm text-gray-500'>
          {documents.length} document{documents.length !== 1 ? 's' : ''} assigned
        </div>
      </div>

      {/* Documents List */}
      <div className='bg-white rounded-xl border border-gray-200 divide-y divide-gray-100'>
        {documents.map((document) => (
          <div key={document.id} className='p-6 hover:bg-gray-50 transition-colors'>
            <div className='flex items-start gap-4'>
              {/* File Icon */}
              <div className='flex-shrink-0 text-2xl mt-1'>{getFileIcon(document.mimeType)}</div>

              {/* Document Info */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold text-gray-800 truncate'>{document.title}</h4>
                    <p className='text-sm text-gray-500 truncate'>{document.originalFileName}</p>
                    {document.description && (
                      <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                        {document.description}
                      </p>
                    )}

                    {/* Status and Metadata */}
                    <div className='flex items-center gap-4 mt-3'>
                      <div className='flex items-center gap-2'>
                        <span className='text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full'>
                          Assigned {formatDate(document.assignedAt)}
                        </span>
                        {document.isSharedWithClient && (
                          <span className='text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1'>
                            <Eye className='w-3 h-3' />
                            Shared with client
                          </span>
                        )}
                      </div>
                    </div>

                    {/* File Metadata */}
                    <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
                      <span className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        Uploaded {formatDate(document.uploadedAt)}
                      </span>
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span className='px-2 py-1 bg-gray-100 text-gray-700 rounded-full'>
                        {DOCUMENT_CATEGORY_LABELS[
                          document.category as keyof typeof DOCUMENT_CATEGORY_LABELS
                        ] || document.category}
                      </span>
                      <span>{FILE_TYPE_LABELS[document.mimeType] || 'Unknown'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className='flex items-center gap-2'>
                    <button
                      onClick={() => downloadDocument(document)}
                      className='p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors'
                      title='Download'
                    >
                      <Download className='w-4 h-4' />
                    </button>
                    {document.isSharedWithClient && (
                      <div
                        className='p-2 text-green-600 bg-green-50 rounded-lg'
                        title='Visible to client'
                      >
                        <Share2 className='w-4 h-4' />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
