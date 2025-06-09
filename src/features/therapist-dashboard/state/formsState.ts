import { signal, computed } from '@preact-signals/safe-react';

import type { FormsState, IntakeForm, FormAssignment } from '../types/forms';

// Global state for forms
export const formsStateSignal = signal<FormsState>({
  forms: [],
  assignments: [],
  loading: false,
  error: null,
  formBuilder: {
    isOpen: false,
  },
});

// Computed values
export const formsForCurrentTherapist = computed(() => {
  // We'll filter by therapist ID when we have it available
  return formsStateSignal.value.forms;
});

export const assignmentsForCurrentClient = computed(() => {
  // We'll filter by client ID when we have it available
  return formsStateSignal.value.assignments;
});

// Actions
export const formsActions = {
  setLoading: (loading: boolean) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      loading,
    };
  },

  setError: (error: string | null) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      error,
    };
  },

  setForms: (forms: IntakeForm[]) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      forms,
    };
  },

  addForm: (form: IntakeForm) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      forms: [...formsStateSignal.value.forms, form],
    };
  },

  updateForm: (formId: string, updates: Partial<IntakeForm>) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      forms: formsStateSignal.value.forms.map((form) =>
        form.id === formId ? { ...form, ...updates } : form,
      ),
    };
  },

  deleteForm: (formId: string) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      forms: formsStateSignal.value.forms.filter((form) => form.id !== formId),
      assignments: formsStateSignal.value.assignments.filter(
        (assignment) => assignment.formId !== formId,
      ),
    };
  },

  setAssignments: (assignments: FormAssignment[]) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      assignments,
    };
  },

  addAssignment: (assignment: FormAssignment) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      assignments: [...formsStateSignal.value.assignments, assignment],
    };
  },

  updateAssignment: (assignmentId: string, updates: Partial<FormAssignment>) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      assignments: formsStateSignal.value.assignments.map((assignment) =>
        assignment.id === assignmentId ? { ...assignment, ...updates } : assignment,
      ),
    };
  },

  openFormBuilder: (editingForm?: IntakeForm) => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      formBuilder: {
        isOpen: true,
        editingForm,
      },
    };
  },

  closeFormBuilder: () => {
    formsStateSignal.value = {
      ...formsStateSignal.value,
      formBuilder: {
        isOpen: false,
        editingForm: undefined,
      },
    };
  },

  reset: () => {
    formsStateSignal.value = {
      forms: [],
      assignments: [],
      loading: false,
      error: null,
      formBuilder: {
        isOpen: false,
      },
    };
  },
};

// Helper functions to get filtered data
export const getFormsByTherapist = (therapistId: number): IntakeForm[] => {
  return formsStateSignal.value.forms.filter((form) => form.therapistId === therapistId);
};

export const getAssignmentsByClient = (clientId: string): FormAssignment[] => {
  return formsStateSignal.value.assignments.filter(
    (assignment) => assignment.clientId === clientId,
  );
};

export const getAssignmentsByForm = (formId: string): FormAssignment[] => {
  return formsStateSignal.value.assignments.filter((assignment) => assignment.formId === formId);
};
