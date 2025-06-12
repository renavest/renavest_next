import { signal } from '@preact-signals/safe-react';

// Types for client-side form management
export interface ClientFormField {
  id: string;
  type: 'text' | 'email' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

export interface ClientFormAssignment {
  id: string;
  formId: string;
  formTitle: string;
  formDescription?: string;
  fields: ClientFormField[];
  status: 'sent' | 'completed' | 'expired';
  sentAt: string;
  completedAt?: string;
  expiresAt?: string;
  therapistName: string;
  responses?: Record<string, unknown>;
}

export interface ClientFormResponse {
  fieldId: string;
  value: unknown;
}

export interface ClientFormsState {
  assignments: ClientFormAssignment[];
  currentForm: ClientFormAssignment | null;
  responses: Record<string, unknown>;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  validationErrors: Record<string, string>;
}

// Initial state
const initialState: ClientFormsState = {
  assignments: [],
  currentForm: null,
  responses: {},
  loading: false,
  submitting: false,
  error: null,
  validationErrors: {},
};

// Global state signal
export const clientFormsStateSignal = signal<ClientFormsState>(initialState);

// Actions
export const clientFormsActions = {
  setLoading: (loading: boolean) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      loading,
    };
  },

  setSubmitting: (submitting: boolean) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      submitting,
    };
  },

  setError: (error: string | null) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      error,
    };
  },

  setAssignments: (assignments: ClientFormAssignment[]) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      assignments,
    };
  },

  setCurrentForm: (form: ClientFormAssignment | null) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      currentForm: form,
      responses: form ? {} : {},
      validationErrors: {},
    };
  },

  setResponse: (fieldId: string, value: unknown) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      responses: {
        ...clientFormsStateSignal.value.responses,
        [fieldId]: value,
      },
      // Clear validation error for this field
      validationErrors: {
        ...clientFormsStateSignal.value.validationErrors,
        [fieldId]: '',
      },
    };
  },

  setValidationErrors: (errors: Record<string, string>) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      validationErrors: errors,
    };
  },

  clearValidationError: (fieldId: string) => {
    const newErrors = { ...clientFormsStateSignal.value.validationErrors };
    delete newErrors[fieldId];
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      validationErrors: newErrors,
    };
  },

  updateAssignmentStatus: (
    assignmentId: string,
    status: 'completed' | 'expired',
    responses?: Record<string, unknown>,
  ) => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      assignments: clientFormsStateSignal.value.assignments.map((assignment) =>
        assignment.id === assignmentId
          ? {
              ...assignment,
              status,
              completedAt:
                status === 'completed' ? new Date().toISOString() : assignment.completedAt,
              responses: responses || assignment.responses,
            }
          : assignment,
      ),
    };
  },

  reset: () => {
    clientFormsStateSignal.value = initialState;
  },

  resetForm: () => {
    clientFormsStateSignal.value = {
      ...clientFormsStateSignal.value,
      currentForm: null,
      responses: {},
      validationErrors: {},
      error: null,
    };
  },
};

// Computed values
export const getAssignmentsByStatus = (status: 'sent' | 'completed' | 'expired') => {
  return clientFormsStateSignal.value.assignments.filter(
    (assignment) => assignment.status === status,
  );
};

export const getFormProgress = () => {
  const { currentForm, responses } = clientFormsStateSignal.value;
  if (!currentForm) return 0;

  const requiredFields = currentForm.fields.filter((field) => field.required);
  const completedRequiredFields = requiredFields.filter(
    (field) =>
      responses[field.id] !== undefined &&
      responses[field.id] !== '' &&
      responses[field.id] !== null,
  );

  return requiredFields.length > 0
    ? (completedRequiredFields.length / requiredFields.length) * 100
    : 0;
};

export const canSubmitForm = () => {
  const { currentForm, responses, validationErrors } = clientFormsStateSignal.value;
  if (!currentForm) return false;

  // Check if all required fields are filled
  const requiredFields = currentForm.fields.filter((field) => field.required);
  const allRequiredFieldsFilled = requiredFields.every(
    (field) =>
      responses[field.id] !== undefined &&
      responses[field.id] !== '' &&
      responses[field.id] !== null,
  );

  // Check if there are no validation errors
  const hasValidationErrors = Object.values(validationErrors).some((error) => error !== '');

  return allRequiredFieldsFilled && !hasValidationErrors;
};
