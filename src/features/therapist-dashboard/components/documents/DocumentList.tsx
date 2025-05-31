'use client';

import {
  FileText,
  Download,
  Share2,
  MoreVertical,
  Calendar,
  Filter,
  Search,
  Loader2,
  Users,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import { trackTherapistDashboard } from '@/src/features/posthog/therapistTracking';
import { therapistIdSignal } from '@/src/features/therapist-dashboard/state/therapistDashboardState';

import {
  TherapistDocument,
  DOCUMENT_CATEGORY_LABELS,
  DOCUMENT_CATEGORIES,
  FILE_TYPE_LABELS,
} from '../../types/documents';
import { ClientAssignmentModal } from './ClientAssignmentModal';

interface DocumentListProps {
  documents: TherapistDocument[];
  onRefresh: () => void;
  loading?: boolean;
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
const downloadDocument = async (document: TherapistDocument): Promise<void> => {
  try {
    const response = await fetch(
      `/api/therapist/documents/download?s3Key=${encodeURIComponent(document.s3Key)}`,
    );

    if (!response.ok) {
      throw new Error('Failed to get download URL');
    }

    const data = await response.json();

    // Open download URL in new tab
    window.open(data.downloadUrl, '_blank');

    // Track download
    if (therapistIdSignal.value) {
      trackTherapistDashboard.documentDownloaded(therapistIdSignal.value, {
        user_id: `therapist_${therapistIdSignal.value}`,
        document_id: document.id,
        document_type: document.category,
      });
    }
  } catch (error) {
    console.error('Error downloading document:', error);
    alert('Failed to download document. Please try again.');
  }
};

export function DocumentList({ documents, onRefresh, loading = false }: DocumentListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [assignmentModal, setAssignmentModal] = useState<{
    isOpen: boolean;
    document: TherapistDocument | null;
  }>({ isOpen: false, document: null });

  // Filter and sort documents
  const filteredAndSortedDocuments = documents
    .filter((doc) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'size':
          comparison = a.fileSize - b.fileSize;
          break;
        case 'date':
        default:
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
          break;
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleOpenAssignmentModal = (document: TherapistDocument) => {
    setAssignmentModal({ isOpen: true, document });
  };

  const handleCloseAssignmentModal = () => {
    setAssignmentModal({ isOpen: false, document: null });
  };

  const handleAssignmentUpdate = () => {
    onRefresh();
  };

  return (
    <>
      <div className='bg-white rounded-xl border border-purple-100 shadow-sm'>
        {/* Header */}
        <div className='p-6 border-b border-gray-100'>
          <div className='flex items-center justify-between mb-4'>
            <div className='flex items-center gap-3'>
              <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
                <FileText className='w-5 h-5 text-purple-600' />
              </div>
              <div>
                <h3 className='text-lg font-semibold text-gray-800'>My Documents</h3>
                <p className='text-sm text-gray-600'>
                  {documents.length} document{documents.length !== 1 ? 's' : ''} uploaded
                </p>
              </div>
            </div>
            <button
              onClick={onRefresh}
              disabled={loading}
              className='px-4 py-2 text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-50'
            >
              {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Refresh'}
            </button>
          </div>

          {/* Filters and Search */}
          <div className='flex flex-col sm:flex-row gap-4'>
            {/* Search */}
            <div className='flex-1 relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4' />
              <input
                type='text'
                placeholder='Search documents...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className='w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              />
            </div>

            {/* Category Filter */}
            <div className='flex items-center gap-2'>
              <Filter className='w-4 h-4 text-gray-400' />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              >
                <option value='all'>All Categories</option>
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {DOCUMENT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div className='flex items-center gap-2'>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-') as [
                    typeof sortBy,
                    typeof sortOrder,
                  ];
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className='px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
              >
                <option value='date-desc'>Newest First</option>
                <option value='date-asc'>Oldest First</option>
                <option value='name-asc'>Name A-Z</option>
                <option value='name-desc'>Name Z-A</option>
                <option value='size-desc'>Largest First</option>
                <option value='size-asc'>Smallest First</option>
              </select>
            </div>
          </div>
        </div>

        {/* Document List */}
        <div className='divide-y divide-gray-100'>
          {loading && documents.length === 0 ? (
            <div className='p-8 text-center'>
              <Loader2 className='w-8 h-8 animate-spin text-purple-400 mx-auto mb-4' />
              <p className='text-gray-500'>Loading documents...</p>
            </div>
          ) : filteredAndSortedDocuments.length === 0 ? (
            <div className='p-8 text-center'>
              <FileText className='w-12 h-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500 mb-2'>
                {searchTerm || selectedCategory !== 'all'
                  ? 'No documents match your filters'
                  : 'No documents uploaded yet'}
              </p>
              {searchTerm || selectedCategory !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className='text-purple-600 hover:text-purple-700 text-sm font-medium'
                >
                  Clear filters
                </button>
              ) : (
                <p className='text-sm text-gray-400'>Upload your first document to get started</p>
              )}
            </div>
          ) : (
            filteredAndSortedDocuments.map((document) => (
              <div key={document.id} className='p-6 hover:bg-gray-50 transition-colors'>
                <div className='flex items-start gap-4'>
                  {/* File Icon */}
                  <div className='flex-shrink-0 text-2xl mt-1'>
                    {getFileIcon(document.mimeType)}
                  </div>

                  {/* Document Info */}
                  <div className='flex-1 min-w-0'>
                    <div className='flex items-start justify-between gap-4'>
                      <div className='flex-1 min-w-0'>
                        <h4 className='font-semibold text-gray-800 truncate'>{document.title}</h4>
                        <p className='text-sm text-gray-500 truncate'>
                          {document.originalFileName}
                        </p>
                        {document.description && (
                          <p className='text-sm text-gray-600 mt-1 line-clamp-2'>
                            {document.description}
                          </p>
                        )}

                        {/* Assignment Info */}
                        {document.assignments && document.assignments.length > 0 && (
                          <div className='mt-2'>
                            <div className='flex items-center gap-2 text-xs text-purple-600'>
                              <Users className='w-3 h-3' />
                              <span>
                                Assigned to {document.assignments.length} client
                                {document.assignments.length !== 1 ? 's' : ''}
                              </span>
                              {document.assignments.some((a) => a.isSharedWithClient) && (
                                <span className='px-2 py-1 bg-green-100 text-green-700 rounded-full'>
                                  {document.assignments.filter((a) => a.isSharedWithClient).length}{' '}
                                  shared
                                </span>
                              )}
                            </div>
                            <div className='flex flex-wrap gap-1 mt-1'>
                              {document.assignments.slice(0, 3).map((assignment) => (
                                <span
                                  key={assignment.userId}
                                  className='text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full'
                                >
                                  {assignment.user.fullName}
                                  {assignment.isSharedWithClient && ' ✓'}
                                </span>
                              ))}
                              {document.assignments.length > 3 && (
                                <span className='text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full'>
                                  +{document.assignments.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Metadata */}
                        <div className='flex items-center gap-4 mt-2 text-xs text-gray-500'>
                          <span className='flex items-center gap-1'>
                            <Calendar className='w-3 h-3' />
                            {formatDate(document.uploadedAt)}
                          </span>
                          <span>{formatFileSize(document.fileSize)}</span>
                          <span className='px-2 py-1 bg-purple-100 text-purple-700 rounded-full'>
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
                          className='px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium'
                          title='Download'
                        >
                          <div className='flex items-center gap-1'>
                            <Download className='w-4 h-4' />
                            Download
                          </div>
                        </button>
                        <button
                          onClick={() => handleOpenAssignmentModal(document)}
                          className='px-3 py-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors text-sm font-medium'
                          title='Manage Client Access'
                        >
                          <div className='flex items-center gap-1'>
                            <Users className='w-4 h-4' />
                            Manage Access
                          </div>
                        </button>
                        <button
                          onClick={() => {
                            // TODO: Implement more actions (delete, edit, etc.)
                            alert('More actions coming soon!');
                          }}
                          className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors'
                          title='More Actions'
                        >
                          <MoreVertical className='w-4 h-4' />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Assignment Modal */}
      {assignmentModal.document && (
        <ClientAssignmentModal
          isOpen={assignmentModal.isOpen}
          onClose={handleCloseAssignmentModal}
          document={assignmentModal.document}
          onAssignmentUpdate={handleAssignmentUpdate}
        />
      )}
    </>
  );
}
