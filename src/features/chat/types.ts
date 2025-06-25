// Chat Feature Types

export interface Message {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  channelId: number;
  ts: number;
  messageType?: string;
}

// Channel type is centralized in therapist-dashboard/types/components.ts
import { Channel as CentralChannel } from '@/src/features/therapist-dashboard/types/components';

export type Channel = CentralChannel;

export interface ChatInterfaceProps {
  therapistId?: number;
  userRole: 'therapist' | 'prospect';
}

export interface ChatMessageAreaProps {
  activeChannel: Channel | null;
  messages: Message[];
  newMessage: string;
  loading: boolean;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isMyMessage: (message: Message) => boolean;
  formatTime: (timestamp: string | number) => string;
  showExportButton?: boolean;
}

export interface ConnectionStatusIndicatorProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export interface ChatContext {
  userRole: 'therapist' | 'prospect' | null;
  therapistId: number | null;
  userId: number | null;
  isLoading: boolean;
}

export interface UseChatReturn {
  messages: Message[];
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  sendMessage: (text: string, author: string) => Promise<boolean>;
}

export interface ChatHookOptions {
  channelId: number | null;
}

export interface ChatChannelListProps {
  channels: Channel[];
  activeChannelId: number | null;
  onChannelSelect: (channel: Channel) => void;
}

// API Response Types
export interface SendMessageRequest {
  channelId: number;
  content: string;
  messageType: string;
}

export interface SendMessageResponse {
  success: boolean;
  message?: string;
}

// Event Types for SSE
export interface SSEConnectionEvent {
  type: 'connected';
  channelId: number;
}

export interface SSEMessageEvent extends Message {
  type: 'message';
}

export type SSEEvent = SSEConnectionEvent | SSEMessageEvent;
