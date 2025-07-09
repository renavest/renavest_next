# Chat Feature Production Setup Guide

## Overview

The chat feature in Renavest is production-ready but requires proper environment configuration to function in production environments. This guide outlines the necessary steps to enable chat functionality in production.

## ✅ Production Readiness Status

The chat feature is **PRODUCTION READY** with the following capabilities:
- ✅ Secure authentication via Clerk
- ✅ Role-based access control (therapist/prospect)
- ✅ Subscription requirement enforcement
- ✅ Real-time messaging via Server-Sent Events (SSE)
- ✅ HIPAA-compliant message handling
- ✅ Redis-based message caching
- ✅ Database persistence
- ✅ Export functionality for compliance
- ✅ Proper error handling and recovery

## Required Environment Variables

### 1. **Chat Feature Flag (CRITICAL)**
```env
# REQUIRED: Enable chat feature in production
NEXT_PUBLIC_ENABLE_CHAT_FEATURE='true'
```

**⚠️ WARNING**: If this is not set to `'true'`, the entire chat system will be disabled.

### 2. **Redis Configuration (REQUIRED)**
```env
# Upstash Redis for real-time chat functionality
UPSTASH_REDIS_REST_URL=https://your-redis-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_redis_token
UPSTASH_REDIS_URL=redis://default:your_redis_token@your-redis-instance.upstash.io:6379
```

### 3. **Database Configuration (REQUIRED)**
```env
# PostgreSQL database with chat tables
DB_HOST=your-production-db-host
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=your-production-database
DB_PORT=5432
```

### 4. **Clerk Authentication (REQUIRED)**
```env
# Clerk for user authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
CLERK_SECRET_KEY=sk_live_your_production_secret
```

## Database Schema Requirements

Ensure the following tables exist in your production database:

### Chat Channels Table
```sql
CREATE TABLE chat_channels (
  id SERIAL PRIMARY KEY,
  channel_identifier VARCHAR UNIQUE NOT NULL,
  therapist_id INTEGER NOT NULL,
  prospect_user_id INTEGER NOT NULL,
  status VARCHAR DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP,
  FOREIGN KEY (therapist_id) REFERENCES therapists(id),
  FOREIGN KEY (prospect_user_id) REFERENCES users(id)
);
```

### Chat Messages Table
```sql
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  channel_id INTEGER NOT NULL,
  author_email VARCHAR NOT NULL,
  author_name VARCHAR NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (channel_id) REFERENCES chat_channels(id) ON DELETE CASCADE
);
```

## Redis Setup

### Using Upstash (Recommended)
1. Create an Upstash Redis instance
2. Configure the connection URLs in environment variables
3. The application will automatically use Redis for real-time message caching
4. Database serves as backup when Redis is unavailable

### Alternative Redis Providers
Any Redis-compatible service can be used. Update the connection URLs accordingly.

## API Endpoints

The following API endpoints are available for chat functionality:

### Real-time Messaging (SSE)
- **GET** `/api/chat/[channelId]` - Server-Sent Events endpoint for real-time messages
- **Authentication**: Required (Clerk)
- **Subscription**: Required (active subscription)

### Message Operations
- **POST** `/api/chat/send` - Send a new message
- **POST** `/api/chat/messaging` - Channel management and message operations
- **GET** `/api/chat/export` - Export chat history (therapists only)

## Security Considerations

### Authentication
- All chat endpoints require Clerk authentication
- Users can only access their own chat channels
- Role-based access controls are enforced

### Authorization
- Therapists can access channels for their clients
- Prospects can access channels for their sessions
- Export functionality is restricted to therapists only

### Data Protection
- Messages are stored securely in PostgreSQL
- Redis caching includes appropriate TTL settings
- No sensitive data is logged or exposed in error messages

## Subscription Requirements

### Required Subscription
Chat functionality requires an active subscription:
- Individual subscriptions
- Employer-sponsored subscriptions
- Free trial periods (if configured)

### Graceful Degradation
- Users without subscriptions receive clear error messages
- Chat UI is hidden for non-subscribed users
- No partial functionality is exposed

## Feature Flags and Toggles

### Environment-based Control
```env
# Enable/disable chat feature entirely
NEXT_PUBLIC_ENABLE_CHAT_FEATURE='true'  # or 'false'
```

### Runtime Checks
The application checks this flag at:
- Component render time (UI elements)
- API endpoint initialization
- Feature availability checks

## Performance Considerations

### Real-time Communication
- Uses Server-Sent Events (SSE) instead of WebSockets
- Automatic reconnection and heartbeat
- Message deduplication
- Efficient polling intervals

### Caching Strategy
- Redis for recent message history (50 messages)
- PostgreSQL for persistent storage
- Automatic fallback to database when Redis unavailable

### Connection Management
- Automatic cleanup of inactive connections
- Heartbeat monitoring
- Graceful error recovery

## Monitoring and Logging

### Key Metrics to Monitor
- SSE connection count and duration
- Redis performance and connection health
- Database query performance for chat operations
- Message delivery success rates

### Logging
- Connection establishment/termination
- Message send/receive events
- Error conditions and recovery
- Performance metrics

## Troubleshooting

### Chat Not Visible
1. Check `NEXT_PUBLIC_ENABLE_CHAT_FEATURE='true'` in environment
2. Verify user has active subscription
3. Confirm Clerk authentication is working

### Messages Not Sending
1. Check Redis connectivity
2. Verify database connection
3. Confirm subscription status
4. Check API endpoint authentication

### Real-time Updates Not Working
1. Verify SSE endpoint is accessible
2. Check Redis pub/sub functionality
3. Confirm browser supports SSE
4. Check for firewall/proxy issues

## Production Deployment Checklist

- [ ] Set `NEXT_PUBLIC_ENABLE_CHAT_FEATURE='true'`
- [ ] Configure Redis connection (Upstash recommended)
- [ ] Verify database tables exist
- [ ] Test Clerk authentication
- [ ] Confirm subscription middleware works
- [ ] Test SSE endpoint connectivity
- [ ] Verify message persistence
- [ ] Test export functionality
- [ ] Set up monitoring and alerts
- [ ] Configure production URLs (Google Calendar, etc.)

## Support and Maintenance

### Regular Maintenance
- Monitor Redis memory usage and performance
- Review database query performance
- Check SSE connection health
- Update Redis cache TTL if needed

### Updates and Changes
- Test chat functionality after any Clerk updates
- Verify Redis compatibility after infrastructure changes
- Test subscription middleware after billing changes

## Compliance Notes

### HIPAA Compliance
- Messages are treated as PHI (Protected Health Information)
- Export functionality includes confidentiality notices
- Proper audit trails are maintained
- Data retention policies should be implemented

### Data Retention
- Consider implementing message retention policies
- Regular database cleanup may be required
- Backup strategies should include chat data

---

**Last Updated**: July 2025
**Version**: 1.0
**Status**: Production Ready ✅