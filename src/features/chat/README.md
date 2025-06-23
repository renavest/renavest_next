# Chat Feature

The chat feature provides real-time messaging capabilities between therapists and prospects, enabling secure therapeutic communication within the platform.

## Architecture Overview

The chat system is built on Server-Sent Events (SSE) for real-time communication, providing a responsive and scalable messaging experience without the complexity of WebSockets.

## Core Technologies

- **Real-time Communication**: Server-Sent Events (SSE)
- **Authentication**: Clerk integration for role-based access
- **State Management**: React hooks with local state
- **Compliance**: Message export functionality for therapeutic records
- **UI Components**: Tailwind CSS with responsive design

## Feature Structure

```
src/features/chat/
├── components/
│   ├── ChatMessageArea.tsx           # Main chat interface component
│   ├── ConnectionStatusIndicator.tsx # Real-time connection status
│   └── ChatChannelList.tsx          # Channel selection sidebar
├── hooks/
│   ├── useChat.ts                   # Core chat logic and SSE connection
│   └── useChatContext.ts            # User role and context management
├── state/                           # Reserved for future state management
├── types.ts                         # Consolidated TypeScript definitions
├── index.ts                         # Feature exports
└── README.md                        # This documentation
```

## Components

### ChatMessageArea
The primary chat interface featuring:
- **Real-time Messaging**: Live message display with SSE integration
- **Role-based UI**: Different experiences for therapists vs prospects
- **Message Export**: Compliance-focused chat history export
- **Responsive Design**: Mobile-optimized with conversation starter prompts
- **Connection Status**: Visual indicators for real-time connection health

**Key Props:**
```typescript
interface ChatMessageAreaProps {
  activeChannel: Channel | null;
  messages: Message[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  // ... additional props for event handlers
}
```

### ConnectionStatusIndicator
Displays real-time connection status with visual feedback:
- **Connected**: Green indicator with pulse animation
- **Connecting**: Yellow with loading animation
- **Error**: Red with error state
- **Disconnected**: Gray with inactive state

### ChatChannelList
Channel selection interface allowing users to:
- Browse active conversations
- Switch between different client/therapist pairs
- Display participant names and last activity

## Hooks

### useChat
Core hook managing SSE connection and message handling:

```typescript
const { messages, connectionStatus, sendMessage } = useChat(channelId);
```

**Features:**
- Automatic SSE connection management
- Message deduplication and sorting
- Connection state tracking
- Error handling and recovery

**Connection Lifecycle:**
1. Establishes SSE connection to `/api/chat/${channelId}`
2. Handles connection confirmation events
3. Processes incoming messages with deduplication
4. Manages connection errors and cleanup

### useChatContext
Provides user role and authentication context:

```typescript
const { userRole, therapistId, userId, isLoading } = useChatContext();
```

**Role Detection:**
- Integrates with Clerk authentication
- Determines user role (therapist/prospect) from metadata
- Provides therapist ID for routing and permissions

## API Integration

### Required Endpoints

**SSE Endpoint:**
- `GET /api/chat/{channelId}` - Real-time message stream

**Message Operations:**
- `POST /api/chat/send` - Send new message
- `GET /api/chat/export` - Export chat history for compliance

**Request/Response Types:**
```typescript
// Send Message
POST /api/chat/send
{
  channelId: number;
  content: string;
  messageType: 'STANDARD';
}

// Export Chat
GET /api/chat/export?channelId={id}
Response: Text file download with formatted chat history
```

## State Management

Currently uses local React state via hooks. The empty `state/` directory is reserved for future global state management if needed.

**Current State Flow:**
- Connection status managed in `useChat`
- User context managed in `useChatContext`
- Component state for UI interactions (modals, inputs)

## Real-time Architecture

### Server-Sent Events (SSE)
- **Connection**: Automatic connection per channel
- **Event Types**: Connection confirmation, message delivery
- **Error Handling**: Automatic reconnection and error states
- **Performance**: Efficient message streaming with deduplication

### Message Flow
1. User types message in chat input
2. `sendMessage` function posts to API
3. Server processes and broadcasts to channel
4. SSE delivers message to all connected clients
5. Local state updates trigger UI re-render

## Security & Compliance

### Authentication
- All chat access requires Clerk authentication
- Role-based access control (therapist/prospect)
- Channel access verified server-side

### Data Privacy
- Messages stored securely with encryption
- Export functionality for therapeutic record keeping
- HIPAA-compliant message handling

### Message Export
Therapeutic compliance feature allowing:
- Complete chat history export
- Formatted text files for record keeping
- Automatic filename generation with timestamps

## Responsive Design

### Desktop Experience
- Split-pane layout with channel list and message area
- Full conversation history visibility
- Rich message composition tools

### Mobile Experience
- Optimized single-pane mobile layout
- Touch-friendly message bubbles
- Conversation starter prompts for therapists

## Usage Examples

### Basic Chat Integration
```typescript
import { ChatMessageArea, useChat, useChatContext } from '@/features/chat';

function ChatPage() {
  const { userRole, therapistId } = useChatContext();
  const { messages, connectionStatus, sendMessage } = useChat(channelId);

  return (
    <ChatMessageArea
      activeChannel={channel}
      messages={messages}
      connectionStatus={connectionStatus}
      onSendMessage={() => sendMessage(newMessage, userEmail)}
      // ... other props
    />
  );
}
```

### Connection Status Monitoring
```typescript
import { ConnectionStatusIndicator } from '@/features/chat';

function ChatHeader({ connectionStatus }) {
  return (
    <div className="chat-header">
      <ConnectionStatusIndicator connectionStatus={connectionStatus} />
    </div>
  );
}
```

## Environment Configuration

### Feature Flag
```env
NEXT_PUBLIC_ENABLE_CHAT_FEATURE=true  # Enable/disable chat functionality
```

### Development Notes
- Chat feature respects environment flag for development/production control
- SSE connections automatically clean up on component unmount
- Message history is preserved during connection interruptions

## Performance Considerations

### Optimization Features
- Message deduplication prevents duplicate displays
- Automatic scroll management for new messages
- Efficient re-rendering with proper key props
- Connection pooling and cleanup

### Scalability
- SSE provides efficient one-way communication
- Channel-based isolation prevents cross-talk
- Minimal server resources compared to WebSocket alternatives

## Testing Considerations

### Unit Testing
- Mock SSE connections for hook testing
- Test message sorting and deduplication logic
- Verify role-based UI rendering

### Integration Testing
- End-to-end message flow testing
- Connection error recovery testing
- Export functionality verification

### Manual Testing Scenarios
- Multi-user real-time messaging
- Connection interruption and recovery
- Mobile responsive behavior
- Export file generation and download

## Code Quality Features

- **Type Safety**: Comprehensive TypeScript coverage
- **Error Boundaries**: Graceful degradation on failures
- **Accessibility**: Keyboard navigation and screen reader support
- **Performance**: Optimized rendering and memory usage
- **Security**: Authentication verification and role-based access

## Future Enhancements

### Potential Improvements
- Read receipts and typing indicators
- Message search and filtering
- File attachment support
- Push notifications for offline users
- Message threading for complex conversations

### Architecture Readiness
- State directory prepared for global state management
- Modular component structure supports feature extensions
- Type system designed for additional message types
- API structure supports additional endpoints

## Developer Handoff Notes

### Critical Business Logic
- Chat represents core therapeutic engagement tool
- Export functionality required for compliance and record-keeping
- Real-time nature essential for therapeutic relationship building
- Role-based access crucial for privacy and security

### Maintenance Priorities
1. **SSE Connection Stability**: Monitor and improve connection reliability
2. **Message Delivery**: Ensure 100% message delivery success
3. **Export Compliance**: Maintain accurate record export functionality
4. **Mobile Performance**: Continue optimizing mobile chat experience

### Known Limitations
- No offline message queuing (requires active connection)
- Single message type (no rich media yet)
- No conversation search functionality
- Manual channel management (no auto-channel creation) 