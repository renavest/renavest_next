'use client';

import { AlertCircle } from 'lucide-react';
import { COLORS } from '@/src/styles/colors';
import type { ClientFormField } from '../../state/clientFormsState';

interface ClientFormFieldProps {
  field: ClientFormField;
  value: unknown;
  error?: string;
  onChange: (value: unknown) => void;
  onBlur?: () => void;
}

export function ClientFormFieldComponent({
  field,
  value,
  error,
  onChange,
  onBlur,
}: ClientFormFieldProps) {
  const baseInputClasses = `
    w-full p-3 rounded-lg border transition-colors
    ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-purple-500'}
    focus:outline-none focus:ring-2 focus:border-transparent
  `;

  const renderField = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={(value as string) || ''}
            onChange={(e) =>
              onChange(field.type === 'number' ? Number(e.target.value) : e.target.value)
            }
            onBlur={onBlur}
            placeholder={field.placeholder}
            className={baseInputClasses}
            min={field.validation?.min}
            max={field.validation?.max}
            pattern={field.validation?.pattern}
          />
        );

      case 'date':
        return (
          <input
            type='date'
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={baseInputClasses}
          />
        );

      case 'textarea':
        return (
          <textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            className={`${baseInputClasses} resize-vertical min-h-[100px]`}
            rows={4}
          />
        );

      case 'select':
        return (
          <select
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            className={baseInputClasses}
          >
            <option value=''>{field.placeholder || 'Select an option...'}</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className='space-y-3'>
            {field.options?.map((option) => (
              <label key={option} className='flex items-center gap-3 cursor-pointer'>
                <input
                  type='radio'
                  name={field.id}
                  value={option}
                  checked={value === option}
                  onChange={(e) => onChange(e.target.value)}
                  onBlur={onBlur}
                  className={`w-4 h-4 ${COLORS.WARM_PURPLE.text} focus:ring-purple-500`}
                />
                <span className='text-gray-700'>{option}</span>
              </label>
            ))}
          </div>
        );

      case 'checkbox':
        return (
          <div className='space-y-3'>
            {field.options?.map((option) => {
              const selectedOptions = (value as string[]) || [];
              return (
                <label key={option} className='flex items-center gap-3 cursor-pointer'>
                  <input
                    type='checkbox'
                    value={option}
                    checked={selectedOptions.includes(option)}
                    onChange={(e) => {
                      const currentValues = (value as string[]) || [];
                      if (e.target.checked) {
                        onChange([...currentValues, option]);
                      } else {
                        onChange(currentValues.filter((v) => v !== option));
                      }
                    }}
                    onBlur={onBlur}
                    className={`w-4 h-4 ${COLORS.WARM_PURPLE.text} focus:ring-purple-500 rounded`}
                  />
                  <span className='text-gray-700'>{option}</span>
                </label>
              );
            })}
          </div>
        );

      default:
        return (
          <input
            type='text'
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={field.placeholder}
            className={baseInputClasses}
          />
        );
    }
  };

  return (
    <div className='space-y-2'>
      <label className='block text-sm font-medium text-gray-700'>
        {field.label}
        {field.required && <span className='text-red-500 ml-1'>*</span>}
      </label>

      {renderField()}

      {error && (
        <div className='flex items-center gap-2 text-red-600 text-sm'>
          <AlertCircle className='w-4 h-4' />
          <span>{error}</span>
        </div>
      )}

      {field.validation?.message && !error && (
        <p className='text-sm text-gray-500'>{field.validation.message}</p>
      )}
    </div>
  );
}
