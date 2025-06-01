'use client';

import { useEffect, useState } from 'react';

import { TherapistDocument } from '../../types/documents';

import { DocumentList } from './DocumentList';
import { DocumentUpload } from './DocumentUpload';

export function DocumentsPage() {
  const [documents, setDocuments] = useState<TherapistDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/therapist/documents');

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleDocumentUploaded = (newDocument: TherapistDocument) => {
    // Add the new document to the beginning of the list
    setDocuments((prev) => [newDocument, ...prev]);
  };

  const handleRefresh = () => {
    fetchDocuments();
  };

  return (
    <div className='space-y-8'>
      {/* Page Header */}
      <div>
        <h1 className='text-2xl font-bold text-gray-800 mb-2'>Document Management</h1>
        <p className='text-gray-600'>
          Upload and manage documents to share with your clients. You can organize materials by
          category and assign them to specific clients for easy access.
        </p>
      </div>

      {/* Upload Section */}
      <DocumentUpload onDocumentUploaded={handleDocumentUploaded} />

      {/* Error Message */}
      {error && (
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-600'>{error}</p>
          <button
            onClick={handleRefresh}
            className='mt-2 text-sm text-red-700 hover:text-red-800 font-medium'
          >
            Try again
          </button>
        </div>
      )}

      {/* Documents List */}
      <DocumentList documents={documents} onRefresh={handleRefresh} loading={loading} />
    </div>
  );
}
