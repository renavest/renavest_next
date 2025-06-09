export interface IntakeForm {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  status: 'draft' | 'active';
  createdAt: string;
  updatedAt: string;
  therapistId: number;
}

export interface FormField {
  id: string;
  type: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'number' | 'date' | 'email';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, checkbox
  validation?: FormFieldValidation;
}

export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
}

export interface FormAssignment {
  id: string;
  formId: string;
  formTitle: string;
  clientId: string;
  status: 'sent' | 'completed' | 'expired';
  sentAt: string;
  completedAt?: string;
  responses?: Record<string, unknown>;
  expiresAt?: string;
}

export interface FormResponse {
  fieldId: string;
  value: unknown;
  completedAt: string;
}

export interface CreateFormRequest {
  title: string;
  description?: string;
  fields: Omit<FormField, 'id'>[];
  therapistId: number;
}

export interface AssignFormRequest {
  formId: string;
  clientId: string;
  expiresInDays?: number;
}

export interface FormBuilderState {
  isOpen: boolean;
  editingForm?: IntakeForm;
}

export interface FormsState {
  forms: IntakeForm[];
  assignments: FormAssignment[];
  loading: boolean;
  error: string | null;
  formBuilder: FormBuilderState;
}
