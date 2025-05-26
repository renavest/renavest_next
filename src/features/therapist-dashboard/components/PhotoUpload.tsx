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
}

export function PhotoUpload({
  currentPhotoUrl,
  therapistName,
  onPhotoUploaded,
  disabled = false,
}: PhotoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a JPEG, PNG, or WebP image.');
      return;
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File too large. Please upload an image smaller than 10MB.');
      return;
    }

    setError(null);

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    // Upload the file
    uploadPhoto(file);
  };

  const uploadPhoto = async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/therapist/upload-photo', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload photo');
      }

      // Call the callback with the new photo URL
      onPhotoUploaded(data.profileUrl);

      // Clean up preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }

      // Reload the page to ensure the new image is displayed
      window.location.reload();
    } catch (err) {
      console.error('Photo upload error:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload photo');

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
    fileInputRef.current?.click();
  };

  const handleRemovePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const displayImageUrl =
    previewUrl || getTherapistImageUrl(currentPhotoUrl || therapistName || '');
  const isPlaceholder = !previewUrl && !currentPhotoUrl;

  return (
    <div className='space-y-4'>
      <label className='block text-sm font-semibold text-gray-700 mb-2'>Profile Photo</label>

      <div className='flex flex-col items-center space-y-4'>
        {/* Photo Preview */}
        <div className='relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-100 border-4 border-purple-100'>
          <Image
            src={displayImageUrl}
            alt={therapistName || 'Profile photo'}
            fill
            className='object-cover object-center'
            onError={() => {
              // Handle image load error
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

        {/* Error Message */}
        {error && <p className='text-sm text-red-600 text-center'>{error}</p>}

        {/* Help Text */}
        <p className='text-xs text-gray-500 text-center max-w-xs'>
          Upload a JPEG, PNG, or WebP image. Maximum file size: 10MB.
        </p>
      </div>
    </div>
  );
}
