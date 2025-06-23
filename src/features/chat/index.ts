// Chat Feature Exports

// Components
export { ChatMessageArea } from './components/ChatMessageArea';
export { ConnectionStatusIndicator } from './components/ConnectionStatusIndicator';
export { ChatChannelList } from './components/ChatChannelList';

// Hooks
export { useChat } from './hooks/useChat';
export { useChatContext } from './hooks/useChatContext';

// State Management (prepared for future use)
export { chatState, chatActions, chatSelectors } from './state/chatState';

// Types
export type {
  Message,
  Channel,
  ChatInterfaceProps,
  ChatMessageAreaProps,
  ConnectionStatusIndicatorProps,
  ChatContext,
  UseChatReturn,
  ChatHookOptions,
  ChatChannelListProps,
  SendMessageRequest,
  SendMessageResponse,
  SSEConnectionEvent,
  SSEMessageEvent,
  SSEEvent,
} from './types';

// Feature namespace for organized imports
export * as ChatFeature from './types';
