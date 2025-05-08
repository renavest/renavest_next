import posthog from 'posthog-js';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { COLORS } from '@/src/styles/colors';

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
};

type FormErrors = {
  firstName?: string;
  email?: string;
};

type AddClientFormProps = {
  formData: FormData;
  errors: FormErrors;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
};

const AddClientForm: React.FC<AddClientFormProps> = ({
  formData,
  errors,
  isSubmitting,
  handleChange,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit} className='space-y-4'>
    <div>
      <label htmlFor='firstName' className='block text-sm font-medium text-gray-700 mb-1'>
        First Name
      </label>
      <input
        type='text'
        id='firstName'
        name='firstName'
        value={formData.firstName}
        onChange={handleChange}
        className={`
          w-full p-3 rounded-lg border 
          ${errors.firstName ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-purple-500
        `}
        placeholder='Enter first name'
      />
      {errors.firstName && <p className='text-red-500 text-xs mt-1'>{errors.firstName}</p>}
    </div>

    <div>
      <label htmlFor='lastName' className='block text-sm font-medium text-gray-700 mb-1'>
        Last Name (Optional)
      </label>
      <input
        type='text'
        id='lastName'
        name='lastName'
        value={formData.lastName}
        onChange={handleChange}
        className={`
          w-full p-3 rounded-lg border 
          border-gray-300
          focus:outline-none focus:ring-2 focus:ring-purple-500
        `}
        placeholder='Enter last name'
      />
    </div>

    <div>
      <label htmlFor='email' className='block text-sm font-medium text-gray-700 mb-1'>
        Email Address
      </label>
      <input
        type='email'
        id='email'
        name='email'
        value={formData.email}
        onChange={handleChange}
        className={`
          w-full p-3 rounded-lg border 
          ${errors.email ? 'border-red-500' : 'border-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-purple-500
        `}
        placeholder='Enter email address'
      />
      {errors.email && <p className='text-red-500 text-xs mt-1'>{errors.email}</p>}
    </div>

    <button
      type='submit'
      disabled={isSubmitting}
      className={`
        w-full p-3 rounded-lg 
        ${COLORS.WARM_PURPLE.bg} 
        text-white 
        hover:${COLORS.WARM_PURPLE['80']} 
        transition-colors
        ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {isSubmitting ? 'Inviting Client...' : 'Invite Client'}
    </button>
  </form>
);

const initialFormData: FormData = {
  firstName: '',
  lastName: '',
  email: '',
};

export const AddNewClientSection = () => {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const trackClientAttempt = () => {
    posthog.capture('therapist_add_client_attempt', {
      firstName: formData.firstName,
      hasLastName: !!formData.lastName,
      emailProvided: !!formData.email,
    });
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      posthog.capture('therapist_add_client_validation_error', {
        errors: Object.keys(newErrors),
      });
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setFormData(initialFormData);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    trackClientAttempt();

    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/therapist/new-client', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        posthog.capture('therapist_add_client_error', {
          error: result.error || 'Failed to create client',
        });
        throw new Error(result.error || 'Failed to create client');
      }

      posthog.capture('therapist_add_client_success', {
        clientId: result.id,
      });

      toast.success('Client added successfully!');
      resetForm();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='bg-white rounded-xl p-8 border border-purple-100 shadow-sm'>
      <AddClientForm
        formData={formData}
        errors={errors}
        isSubmitting={isSubmitting}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
};
