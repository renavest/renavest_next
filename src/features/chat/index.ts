// src/features/chat/index.ts
// Chat feature exports

// Components
export { ChatInterface } from './components/ChatInterface';
export { ChatSidebar } from './components/ChatSidebar';

// Services
export { ChatService } from './services/ChatService';

// Types
export type { 
  ChatChannel,
  ChatMessage,
  ChatUser 
} from '../therapist-dashboard/types'; // Re-export for convenience