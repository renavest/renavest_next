# Notifications Feature

## Overview
Multi-channel notification system for email delivery and in-app notifications across the Renavest platform.

## Structure
```
src/features/notifications/
├── services/
│   └── emailService.ts           # Email delivery via Resend
├── types/
│   ├── emailTypes.ts            # Email template definitions
│   └── notificationTypes.ts     # System notification types
├── index.ts                     # Feature exports
└── README.md                    # This documentation
```

## Features
- **Email Notifications**: Booking confirmations, session reminders, payment receipts
- **Template System**: Reusable email templates with dynamic content
- **Multi-Role Support**: Different notification flows for employees, therapists, employers
- **HIPAA Compliance**: Secure handling of therapeutic communication

## Usage

### Email Service
```typescript
import { emailService } from '@/src/features/notifications';

await emailService.sendBookingConfirmation({
  clientEmail: 'client@example.com',
  therapistEmail: 'therapist@example.com',
  sessionDetails: { date: '2024-01-01', time: '10:00 AM' }
});
```

## Email Templates
- **BookingConfirmationEmailTemplate**: Client and therapist booking confirmations
- **TherapistBookingNotificationEmailTemplate**: New session notifications
- **PaymentReceiptEmailTemplate**: Payment confirmations
- **SystemUpdateEmailTemplate**: Platform updates

## Environment Variables
```env
RESEND_API_KEY=re_xxx  # Required for email delivery
```

## Integration Points
- **Resend**: Email delivery service
- **React Email**: Template rendering system
- **Database**: User and session data for personalization 