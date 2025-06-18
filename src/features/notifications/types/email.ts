export interface EmailTemplate {
  template: string;
  data: Record<string, unknown>;
}

export interface EmailRecipient {
  email: string;
  name: string;
}

export interface EmailRequest {
  to: string;
  subject: string;
  template?: string;
  html?: string;
  text?: string;
  data?: Record<string, unknown>;
}

export interface EmailResponse {
  id: string;
  success: boolean;
  error?: string;
}

export interface SessionCompletionEmailData {
  clientName: string;
  therapistName: string;
  sessionDate: string;
  sessionTime: string;
  paymentRequired: boolean;
  sessionAmount?: number;
  completedByTherapist: boolean;
  dashboardUrl: string;
}

export interface PaymentRequiredEmailData {
  clientName: string;
  therapistName: string;
  sessionAmount: number;
  paymentUrl: string;
}

export interface SessionReceiptEmailData {
  clientName: string;
  therapistName: string;
  sessionDate: string;
  sessionAmount: number;
  receiptUrl: string;
}
