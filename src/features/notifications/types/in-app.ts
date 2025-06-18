export interface InAppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  readAt?: Date;
}

export type NotificationType =
  | 'session_completed'
  | 'payment_required'
  | 'payment_successful'
  | 'session_reminder'
  | 'session_cancelled'
  | 'therapist_message'
  | 'system_update';

export interface CreateInAppNotificationRequest {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface InAppNotificationResponse {
  success: boolean;
  notification?: InAppNotification;
  error?: string;
}
