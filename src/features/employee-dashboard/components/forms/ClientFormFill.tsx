'use client';

import {
  CheckCircle,
  Clock,
  FileText,
  ArrowLeft,
  Send,
  AlertTriangle,
  ProgressIcon as Progress,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { COLORS } from '@/src/styles/colors';

import {
  clientFormsStateSignal,
  clientFormsActions,
  canSubmitForm,
  getFormProgress,
  type ClientFormAssignment,
} from '../../state/clientFormsState';

import { ClientFormFieldComponent } from './ClientFormField';

interface ClientFormFillProps {
  assignment: ClientFormAssignment;
  onBack: () => void;
}

export function ClientFormFill({ assignment, onBack }: ClientFormFillProps) {
  const formsState = clientFormsStateSignal.value;
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    clientFormsActions.setCurrentForm(assignment);
    return () => {
      clientFormsActions.resetForm();
    };
  }, [assignment]);

  const validateField = (field: any, value: unknown): string => {
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} is required`;
    }

    if (field.type === 'email' && value && typeof value === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return 'Please enter a valid email address';
      }
    }

    if (field.type === 'number' && value !== undefined && value !== '') {
      const numValue = Number(value);
      if (isNaN(numValue)) {
        return 'Please enter a valid number';
      }
      if (field.validation?.min !== undefined && numValue < field.validation.min) {
        return `Value must be at least ${field.validation.min}`;
      }
      if (field.validation?.max !== undefined && numValue > field.validation.max) {
        return `Value must be no more than ${field.validation.max}`;
      }
    }

    if (field.validation?.pattern && value && typeof value === 'string') {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return field.validation.message || 'Invalid format';
      }
    }

    return '';
  };

  const handleFieldChange = (fieldId: string, value: unknown) => {
    clientFormsActions.setResponse(fieldId, value);

    // Validate field on change
    const field = assignment.fields.find((f) => f.id === fieldId);
    if (field) {
      const error = validateField(field, value);
      if (error) {
        clientFormsActions.setValidationErrors({
          ...formsState.validationErrors,
          [fieldId]: error,
        });
      } else {
        clientFormsActions.clearValidationError(fieldId);
      }
    }
  };

  const handleFieldBlur = (fieldId: string) => {
    const field = assignment.fields.find((f) => f.id === fieldId);
    const value = formsState.responses[fieldId];

    if (field) {
      const error = validateField(field, value);
      clientFormsActions.setValidationErrors({
        ...formsState.validationErrors,
        [fieldId]: error,
      });
    }
  };

  const validateAllFields = (): boolean => {
    const errors: Record<string, string> = {};
    let hasErrors = false;

    assignment.fields.forEach((field) => {
      const value = formsState.responses[field.id];
      const error = validateField(field, value);
      if (error) {
        errors[field.id] = error;
        hasErrors = true;
      }
    });

    clientFormsActions.setValidationErrors(errors);
    return !hasErrors;
  };

  const handleSubmit = async () => {
    if (!validateAllFields()) {
      toast.error('Please fix the errors before submitting');
      return;
    }

    clientFormsActions.setSubmitting(true);
    try {
      const response = await fetch(`/api/client/forms/${assignment.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          responses: formsState.responses,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit form');
      }

      // Update the assignment status in state
      clientFormsActions.updateAssignmentStatus(assignment.id, 'completed', formsState.responses);

      toast.success('Form submitted successfully! 🎉');
      setShowConfirmation(true);

      // Auto-redirect after a delay
      setTimeout(() => {
        onBack();
      }, 3000);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit form');
    } finally {
      clientFormsActions.setSubmitting(false);
    }
  };

  const progress = getFormProgress();
  const canSubmit = canSubmitForm();

  // Show confirmation screen after successful submission
  if (showConfirmation) {
    return (
      <div className='max-w-2xl mx-auto p-6'>
        <div className='text-center py-12'>
          <div
            className={`w-20 h-20 ${COLORS.WARM_PURPLE.bg} rounded-full flex items-center justify-center mx-auto mb-6`}
          >
            <CheckCircle className='w-10 h-10 text-white' />
          </div>
          <h2 className='text-3xl font-bold text-gray-900 mb-4'>Thank you!</h2>
          <p className='text-lg text-gray-600 mb-8'>
            Your form has been submitted successfully. Your therapist will review your responses.
          </p>
          <button
            onClick={onBack}
            className={`inline-flex items-center gap-2 px-6 py-3 ${COLORS.WARM_PURPLE.bg} text-white rounded-lg hover:${COLORS.WARM_PURPLE.hover} transition-colors`}
          >
            <ArrowLeft className='w-5 h-5' />
            Back to Forms
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='max-w-4xl mx-auto p-6'>
      {/* Header */}
      <div className='mb-8'>
        <button
          onClick={onBack}
          className='inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors mb-4'
        >
          <ArrowLeft className='w-5 h-5' />
          Back to Forms
        </button>

        <div className='bg-white rounded-xl p-6 shadow-sm border border-purple-100'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='text-2xl font-bold text-gray-900 mb-2'>{assignment.formTitle}</h1>
              {assignment.formDescription && (
                <p className='text-gray-600 mb-4'>{assignment.formDescription}</p>
              )}
              <div className='flex items-center gap-4 text-sm text-gray-500'>
                <span className='flex items-center gap-1'>
                  <FileText className='w-4 h-4' />
                  From {assignment.therapistName}
                </span>
                <span className='flex items-center gap-1'>
                  <Clock className='w-4 h-4' />
                  Sent {new Date(assignment.sentAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {assignment.expiresAt && (
              <div className='flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-2 rounded-lg'>
                <AlertTriangle className='w-4 h-4' />
                <span className='text-sm font-medium'>
                  Expires {new Date(assignment.expiresAt).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className='mb-8'>
        <div className='flex items-center justify-between mb-2'>
          <span className='text-sm font-medium text-gray-700'>Progress</span>
          <span className='text-sm text-gray-500'>{Math.round(progress)}% complete</span>
        </div>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className={`${COLORS.WARM_PURPLE.bg} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className='bg-white rounded-xl p-8 shadow-sm border border-gray-200'>
        <div className='space-y-8'>
          {assignment.fields.map((field, index) => (
            <div key={field.id} className='relative'>
              <div className='absolute -left-6 top-2 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600'>
                {index + 1}
              </div>
              <ClientFormFieldComponent
                field={field}
                value={formsState.responses[field.id]}
                error={formsState.validationErrors[field.id]}
                onChange={(value) => handleFieldChange(field.id, value)}
                onBlur={() => handleFieldBlur(field.id)}
              />
            </div>
          ))}
        </div>

        {/* Submit Section */}
        <div className='mt-12 pt-8 border-t border-gray-200'>
          <div className='flex flex-col sm:flex-row items-center justify-between gap-4'>
            <div className='text-sm text-gray-600'>
              {canSubmit ? (
                <span className='flex items-center gap-2 text-green-600'>
                  <CheckCircle className='w-4 h-4' />
                  Ready to submit
                </span>
              ) : (
                <span className='flex items-center gap-2'>
                  <Progress className='w-4 h-4' />
                  Please complete all required fields
                </span>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || formsState.submitting}
              className={`
                inline-flex items-center gap-2 px-8 py-3 rounded-lg font-medium transition-colors
                ${
                  canSubmit && !formsState.submitting
                    ? `${COLORS.WARM_PURPLE.bg} text-white hover:${COLORS.WARM_PURPLE.hover}`
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }
              `}
            >
              {formsState.submitting ? (
                <>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white' />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className='w-4 h-4' />
                  Submit Form
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
