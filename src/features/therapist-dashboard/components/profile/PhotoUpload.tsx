'use client';
import { Camera, Loader2, Upload, X } from 'lucide-react';
import Image from 'next/image';
import { useRef, useState } from 'react';

import { getTherapistImageUrl } from '@/src/services/s3/assetUrls';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  therapistName?: string;
  onPhotoUploaded: (newPhotoUrl: string) => void;
  disabled?: boolean;
  updatedAt?: string; // ISO string from database for cache-busting
}

// Helper function to validate file
const validateFile = (file: File): string | null => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return 'Please upload a JPEG, PNG, or WebP image.';
  }

  const maxSize = 5 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return 'File too large. Please upload an image smaller than 10MB.';
  }

  return null;
};

// Helper function to handle upload API call
const performUpload = async (
  file: File,
): Promise<{ success: boolean; profileUrl?: string; error?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await fetch('/api/therapist/upload-photo', {
      method: 'POST',
      body: formData,
    });

    // Check for specific HTTP status codes
    if (response.status === 413) {
      return {
        success: false,
        error: 'File is too large. Please choose a smaller image (under 10MB).',
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
        error: 'You need to be logged in to upload photos. Please refresh the page and try again.',
      };
    }

    // Try to parse JSON response
    let data;
    try {
      data = await response.json();
    } catch {
      // If JSON parsing fails, it's likely an HTML error page
      return {
        success: false,
        error: 'Upload service is temporarily unavailable. Please try again later.',
      };
    }

    if (!response.ok) {
      // Use the error message from the API if available, otherwise provide a friendly default
      const errorMessage = data.error || 'Upload failed. Please try again.';

      // Make specific errors more user-friendly
      if (
        errorMessage.includes('AWS') ||
        errorMessage.includes('S3') ||
        errorMessage.includes('configuration')
      ) {
        return {
          success: false,
          error: 'Photo upload is temporarily unavailable. Please contact support.',
        };
      }

      if (errorMessage.includes('File too large')) {
        return {
          success: false,
          error: 'File is too large. Please choose a smaller image (under 10MB).',
        };
      }

      if (errorMessage.includes('Invalid file type')) {
        return {
          success: false,
          error: 'Please upload a JPEG, PNG, or WebP image file.',
        };
      }

      return {
        success: false,
        error: 'Upload failed. Please try again.',
      };
    }

    return { success: true, profileUrl: data.profileUrl };
  } catch {
    // Network or connection errors
    return {
      success: false,
      error: 'Connection error. Please check your internet and try again.',
    };
  }
};

export function PhotoUpload({
  currentPhotoUrl,
  therapistName,
  onPhotoUploaded,
  disabled = false,
  updatedAt,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('File selected:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    });

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      console.error('File validation failed:', validationError);
      return;
    }

    setError(null);
    setDebugInfo(`File validated: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Upload the file
    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setError(null);
    setJustUploaded(false);

    try {
      console.log('Starting upload process...');
      setDebugInfo('Uploading to server...');

      const result = await performUpload(file);

      if (!result.success) {
        const errorMsg = result.error || 'Upload failed. Please try again.';
        console.error('Upload failed:', errorMsg);
        setError(errorMsg);
        return;
      }

      console.log('Upload successful:', result.profileUrl);
      setDebugInfo(`Upload successful!`);
      setJustUploaded(true);

      // Call the callback with the new photo URL
      onPhotoUploaded(result.profileUrl!);

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Show success message briefly
      setTimeout(() => {
        setDebugInfo(null);
        setJustUploaded(false);
      }, 3000);
    } catch (err) {
      console.error('Photo upload error:', err);
      setError("Upload isn't working right now. Please try again later.");

      // Clean up preview URL on error
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (disabled || uploading) return;
    setError(null);
    setDebugInfo(null);
    fileInputRef.current?.click();
  };

  const handleRemovePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    setDebugInfo(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImageUrl = () => {
    if (previewUrl) return previewUrl;

    // Force cache bust if we just uploaded
    const forceRefresh = justUploaded;
    const timestamp = updatedAt ? new Date(updatedAt).getTime() : undefined;

    // Use current timestamp if we just uploaded to ensure immediate update
    const effectiveTimestamp = justUploaded ? Date.now() : timestamp;

    return getTherapistImageUrl(
      currentPhotoUrl || therapistName || '',
      forceRefresh,
      effectiveTimestamp,
    );
  };

  const isPlaceholder = !previewUrl && !currentPhotoUrl;

  return (
    <div className='space-y-4'>
      <label className='block text-sm font-semibold text-gray-700 mb-2'>Profile Photo</label>

      <div className='flex flex-col items-center space-y-4'>
        {/* Photo Preview */}
        <div className='relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-4 border-purple-100'>
          <Image
            key={justUploaded ? `uploaded-${Date.now()}` : currentPhotoUrl || 'default'}
            src={displayImageUrl()}
            alt={therapistName || 'Profile photo'}
            fill
            className='object-cover object-center'
            onError={() => {
              console.error('Image failed to load:', displayImageUrl());
            }}
          />

          {/* Loading overlay */}
          {uploading && (
            <div className='absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center'>
              <Loader2 className='h-8 w-8 text-white animate-spin' />
            </div>
          )}

          {/* Remove preview button */}
          {previewUrl && !uploading && (
            <button
              onClick={handleRemovePreview}
              className='absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 transition-colors'
              aria-label='Remove preview'
            >
              <X className='h-4 w-4' />
            </button>
          )}
        </div>

        {/* Upload Button */}
        <button
          type='button'
          onClick={handleUploadClick}
          disabled={disabled || uploading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
            disabled || uploading
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
              : isPlaceholder
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
          }`}
        >
          {uploading ? (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Uploading...
            </>
          ) : isPlaceholder ? (
            <>
              <Upload className='h-4 w-4' />
              Upload Photo
            </>
          ) : (
            <>
              <Camera className='h-4 w-4' />
              Change Photo
            </>
          )}
        </button>

        {/* File Input */}
        <input
          ref={fileInputRef}
          type='file'
          accept='image/jpeg,image/jpg,image/png,image/webp'
          onChange={handleFileSelect}
          className='hidden'
          disabled={disabled || uploading}
        />

        {/* Debug Info */}
        {debugInfo && (
          <p className='text-xs text-blue-600 text-center max-w-xs bg-blue-50 p-2 rounded'>
            {debugInfo}
          </p>
        )}

        {/* Error Message */}
        {error && (
          <div className='text-red-600 text-sm mt-2 p-2 bg-red-50 rounded-md border border-red-200'>
            {error}
          </div>
        )}

        {/* Help Text */}
        <p className='text-xs text-gray-500 text-center max-w-xs'>
          Upload a JPEG, PNG, or WebP image. Maximum file size: 10MB.
        </p>
      </div>
    </div>
  );
}
