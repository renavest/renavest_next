'use client';

import { FileText, Download, Calendar, User, FolderOpen, File, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SharedDocument {
  id: string;
  title: string;
  description?: string;
  category: string;
  fileName: string;
  originalFileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  assignedAt: string;
  sharedAt?: string;
  therapist: {
    name: string;
    title?: string;
  };
}

// Document category labels
const DOCUMENT_CATEGORY_LABELS: Record<string, string> = {
  financial_planning: 'Financial Planning',
  budget_worksheets: 'Budget Worksheets',
  debt_management: 'Debt Management',
  investment_guides: 'Investment Guides',
  retirement_planning: 'Retirement Planning',
  educational_resources: 'Educational Resources',
  homework_assignments: 'Homework Assignments',
  progress_tracking: 'Progress Tracking',
  general: 'General Resources',
};

// File type icons
const getFileIcon = (mimeType: string) => {
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('image')) return '🖼️';
  if (mimeType.includes('video')) return '🎥';
  if (mimeType.includes('audio')) return '🎵';
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
  if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '📊';
  return '📎';
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Format date
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export function SharedDocumentsSection() {
  const [documents, setDocuments] = useState<SharedDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchSharedDocuments();
  }, []);

  const fetchSharedDocuments = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/employee/documents');
      if (!response.ok) {
        throw new Error('Failed to fetch shared documents');
      }

      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (err) {
      console.error('Error fetching shared documents:', err);
      setError(err instanceof Error ? err.message : 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (document: SharedDocument) => {
    try {
      setDownloadingIds((prev) => new Set(prev).add(document.id));

      const response = await fetch(`/api/employee/documents/${document.id}/download`);
      if (!response.ok) {
        throw new Error('Failed to generate download link');
      }

      const data = await response.json();

      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = data.downloadUrl;
      link.download = document.originalFileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading document:', err);
      setError(err instanceof Error ? err.message : 'Failed to download document');
    } finally {
      setDownloadingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <div className='animate-pulse'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 bg-gray-200 rounded-lg'></div>
            <div className='space-y-2'>
              <div className='h-5 bg-gray-200 rounded w-48'></div>
              <div className='h-4 bg-gray-200 rounded w-64'></div>
            </div>
          </div>
          <div className='space-y-4'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='border border-gray-200 rounded-lg p-4'>
                <div className='flex items-start justify-between'>
                  <div className='flex items-start gap-3 flex-1'>
                    <div className='w-12 h-12 bg-gray-200 rounded-lg'></div>
                    <div className='space-y-2 flex-1'>
                      <div className='h-4 bg-gray-200 rounded w-3/4'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/2'></div>
                      <div className='h-3 bg-gray-200 rounded w-1/3'></div>
                    </div>
                  </div>
                  <div className='w-20 h-8 bg-gray-200 rounded'></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='bg-white rounded-xl shadow-sm border border-gray-100 p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 bg-red-100 rounded-lg'>
            <AlertCircle className='w-5 h-5 text-red-600' />
          </div>
          <div>
            <h3 className='text-xl font-semibold text-gray-800'>Shared Documents</h3>
            <p className='text-gray-600 text-sm'>Resources from your therapist</p>
          </div>
        </div>
        <div className='bg-red-50 border border-red-200 rounded-lg p-4'>
          <p className='text-red-700 text-sm'>{error}</p>
          <button
            onClick={fetchSharedDocuments}
            className='mt-3 text-sm text-red-600 hover:text-red-700 font-medium'
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 p-6'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='p-2 bg-purple-100 rounded-lg'>
          <FolderOpen className='w-5 h-5 text-purple-600' />
        </div>
        <div>
          <h3 className='text-xl font-semibold text-gray-800'>Shared Documents</h3>
          <p className='text-gray-600 text-sm'>Resources from your therapist</p>
        </div>
        {documents.length > 0 && (
          <div className='ml-auto bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium'>
            {documents.length} document{documents.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {documents.length === 0 ? (
        <div className='text-center py-12'>
          <div className='mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4'>
            <FileText className='w-10 h-10 text-gray-400' />
          </div>
          <h4 className='text-lg font-medium text-gray-800 mb-2'>No documents shared yet</h4>
          <p className='text-gray-600 text-sm max-w-md mx-auto leading-relaxed'>
            Your therapist will share educational resources, worksheets, and personalized materials
            here during your sessions.
          </p>
        </div>
      ) : (
        <div className='space-y-4'>
          {documents.map((document) => (
            <div
              key={document.id}
              className='border border-gray-200 rounded-lg p-4 hover:border-purple-200 hover:bg-purple-50/30 transition-all duration-200'
            >
              <div className='flex items-start justify-between'>
                <div className='flex items-start gap-3 flex-1'>
                  {/* File Icon */}
                  <div className='w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center text-xl flex-shrink-0'>
                    {getFileIcon(document.mimeType)}
                  </div>

                  {/* Document Details */}
                  <div className='flex-1 min-w-0'>
                    <h4 className='font-semibold text-gray-800 mb-1 truncate'>{document.title}</h4>
                    {document.description && (
                      <p className='text-sm text-gray-600 mb-2 line-clamp-2'>
                        {document.description}
                      </p>
                    )}

                    {/* Metadata */}
                    <div className='flex flex-wrap items-center gap-4 text-xs text-gray-500'>
                      <div className='flex items-center gap-1'>
                        <File className='w-3 h-3' />
                        <span>{formatFileSize(document.fileSize)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <Calendar className='w-3 h-3' />
                        <span>Shared {formatDate(document.sharedAt || document.assignedAt)}</span>
                      </div>
                      <div className='flex items-center gap-1'>
                        <User className='w-3 h-3' />
                        <span>{document.therapist.name}</span>
                      </div>
                    </div>

                    {/* Category Tag */}
                    <div className='mt-2'>
                      <span className='inline-flex items-center px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full'>
                        {DOCUMENT_CATEGORY_LABELS[document.category] || document.category}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <div className='flex-shrink-0 ml-4'>
                  <button
                    onClick={() => handleDownload(document)}
                    disabled={downloadingIds.has(document.id)}
                    className='flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium'
                  >
                    {downloadingIds.has(document.id) ? (
                      <>
                        <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                        <span>Downloading...</span>
                      </>
                    ) : (
                      <>
                        <Download className='w-4 h-4' />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
