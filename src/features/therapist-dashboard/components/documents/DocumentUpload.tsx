'use client';

import { Upload, FileText, Loader2, X, CheckCircle } from 'lucide-react';
import { useRef, useState } from 'react';

import { trackTherapistDashboard } from '@/src/features/posthog/therapistTracking';
import { therapistIdSignal } from '@/src/features/therapist-dashboard/state/therapistDashboardState';

import {
  DocumentUploadData,
  DOCUMENT_CATEGORIES,
  DOCUMENT_CATEGORY_LABELS,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE,
  FILE_TYPE_LABELS,
} from '../../types/documents';

interface DocumentUploadProps {
  onDocumentUploaded: (document: any) => void;
  disabled?: boolean;
}

// Helper function to validate file
const validateFile = (file: File): string | null => {
  if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
    return 'Please upload a PDF, Word document, text file, or image.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Please upload a file smaller than 25MB.';
  }

  return null;
};

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// Helper function to perform upload API call
const performUpload = async (
  uploadData: DocumentUploadData,
): Promise<{ success: boolean; document?: any; error?: string }> => {
  const formData = new FormData();
  formData.append('file', uploadData.file);
  formData.append('title', uploadData.title);
  if (uploadData.description) formData.append('description', uploadData.description);
  if (uploadData.category) formData.append('category', uploadData.category);

  try {
    const response = await fetch('/api/therapist/documents/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.status === 413) {
      return {
        success: false,
        error: 'File is too large. Please choose a smaller file (under 25MB).',
      };
    }

    if (response.status === 500) {
      return {
        success: false,
        error: 'Upload service is temporarily unavailable. Please try again later.',
      };
    }

    if (response.status === 401) {
      return {
        success: false,
        error:
          'You need to be logged in to upload documents. Please refresh the page and try again.',
      };
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return {
        success: false,
        error: 'Upload service is temporarily unavailable. Please try again later.',
      };
    }

    if (!response.ok) {
      const errorMessage = data.error || 'Upload failed. Please try again.';

      if (errorMessage.includes('AWS') || errorMessage.includes('S3')) {
        return {
          success: false,
          error: 'Document upload is temporarily unavailable. Please contact support.',
        };
      }

      return {
        success: false,
        error: errorMessage,
      };
    }

    return { success: true, document: data.document };
  } catch {
    return {
      success: false,
      error: 'Connection error. Please check your internet and try again.',
    };
  }
};

export function DocumentUpload({ onDocumentUploaded, disabled = false }: DocumentUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState<Partial<DocumentUploadData>>({
    category: 'general',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setSuccess(null);
    setSelectedFile(file);
    setUploadData((prev) => ({
      ...prev,
      file,
      title: prev.title || file.name.replace(/\.[^/.]+$/, ''), // Remove extension for default title
    }));
  };

  const handleUpload = async () => {
    if (!selectedFile || !uploadData.title) {
      setError('Please select a file and provide a title.');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await performUpload({
        file: selectedFile,
        title: uploadData.title,
        description: uploadData.description,
        category: uploadData.category,
      });

      if (!result.success) {
        setError(result.error || 'Upload failed. Please try again.');
        return;
      }

      setSuccess('Document uploaded successfully!');

      // Track document upload
      if (therapistIdSignal.value) {
        trackTherapistDashboard.documentUploaded(therapistIdSignal.value, {
          user_id: `therapist_${therapistIdSignal.value}`,
          document_type: uploadData.category || 'general',
          file_type: selectedFile.type,
        });
      }

      // Call the callback with the new document
      onDocumentUploaded(result.document);

      // Reset form
      setTimeout(() => {
        setSelectedFile(null);
        setUploadData({ category: 'general' });
        setSuccess(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 2000);
    } catch {
      setError("Upload isn't working right now. Please try again later.");
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadData({ category: 'general' });
    setError(null);
    setSuccess(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className='bg-white rounded-xl p-6 border border-purple-100 shadow-sm'>
      <div className='flex items-center gap-3 mb-6'>
        <div className='w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center'>
          <Upload className='w-5 h-5 text-purple-600' />
        </div>
        <div>
          <h3 className='text-lg font-semibold text-gray-800'>Upload Document</h3>
          <p className='text-sm text-gray-600'>Share resources and materials with your clients</p>
        </div>
      </div>

      {/* File Selection */}
      {!selectedFile && (
        <div className='space-y-4'>
          <div
            onClick={() => !disabled && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              disabled
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                : 'border-purple-200 hover:border-purple-300 hover:bg-purple-50/30 cursor-pointer'
            }`}
          >
            <FileText className='w-12 h-12 text-purple-400 mx-auto mb-4' />
            <p className='text-gray-700 font-medium mb-2'>
              {disabled ? 'Upload disabled' : 'Click to select a document'}
            </p>
            <p className='text-sm text-gray-500'>PDF, Word, text files, or images up to 25MB</p>
          </div>

          <input
            ref={fileInputRef}
            type='file'
            accept={ALLOWED_FILE_TYPES.join(',')}
            onChange={handleFileSelect}
            className='hidden'
            disabled={disabled}
          />
        </div>
      )}

      {/* File Selected - Upload Form */}
      {selectedFile && !success && (
        <div className='space-y-4'>
          {/* File Preview */}
          <div className='bg-gray-50 rounded-lg p-4 flex items-center gap-4'>
            <div className='text-2xl'>{getFileIcon(selectedFile.type)}</div>
            <div className='flex-1 min-w-0'>
              <p className='font-medium text-gray-800 truncate'>{selectedFile.name}</p>
              <p className='text-sm text-gray-500'>
                {formatFileSize(selectedFile.size)} •{' '}
                {FILE_TYPE_LABELS[selectedFile.type] || 'Unknown'}
              </p>
            </div>
            <button
              onClick={handleCancel}
              className='text-gray-400 hover:text-gray-600 transition-colors'
              disabled={uploading}
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Upload Form */}
          <div className='space-y-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Document Title *
              </label>
              <input
                type='text'
                value={uploadData.title || ''}
                onChange={(e) => setUploadData((prev) => ({ ...prev, title: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                placeholder='Enter a descriptive title'
                disabled={uploading}
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>Category</label>
              <select
                value={uploadData.category || 'general'}
                onChange={(e) => setUploadData((prev) => ({ ...prev, category: e.target.value }))}
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                disabled={uploading}
              >
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {DOCUMENT_CATEGORY_LABELS[category]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Description (Optional)
              </label>
              <textarea
                value={uploadData.description || ''}
                onChange={(e) =>
                  setUploadData((prev) => ({ ...prev, description: e.target.value }))
                }
                className='w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none'
                rows={3}
                placeholder='Add a description or notes about this document'
                disabled={uploading}
              />
            </div>

            {/* Action Buttons */}
            <div className='flex gap-3 pt-2'>
              <button
                onClick={handleUpload}
                disabled={uploading || !uploadData.title}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  uploading || !uploadData.title
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className='w-4 h-4 animate-spin' />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className='w-4 h-4' />
                    Upload Document
                  </>
                )}
              </button>
              <button
                onClick={handleCancel}
                disabled={uploading}
                className='px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success State */}
      {success && (
        <div className='text-center py-8'>
          <CheckCircle className='w-12 h-12 text-green-500 mx-auto mb-4' />
          <p className='text-green-600 font-medium mb-2'>{success}</p>
          <p className='text-sm text-gray-500'>You can now assign this document to clients</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className='mt-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
          <p className='text-red-600 text-sm'>{error}</p>
        </div>
      )}
    </div>
  );
}
