import { signal, computed } from '@preact-signals/safe-react';

interface Message {
  id: number;
  messageId: string;
  senderId: number;
  content: string;
  messageType: string;
  status: string;
  sentAt: string;
  senderFirstName: string;
  senderLastName: string;
  senderEmail: string;
}

interface Channel {
  id: number;
  channelIdentifier: string;
  therapistId: number;
  prospectUserId: number;
  status: string;
  lastMessageAt: string;
  lastMessagePreview: string;
  unreadCount: number;
  therapistName?: string;
  therapistTitle?: string;
  prospectFirstName?: string;
  prospectLastName?: string;
  prospectEmail?: string;
}

interface ChatState {
  channels: Channel[];
  messages: { [channelId: number]: Message[] };
  activeChannelId: number | null;
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  isInitialized: boolean;
}

// Global chat state using signals
export const chatState = signal<ChatState>({
  channels: [],
  messages: {},
  activeChannelId: null,
  connectionStatus: 'disconnected',
  isInitialized: false,
});

// WebSocket connection
let ws: WebSocket | null = null;
let reconnectAttempts = 0;
const maxReconnectAttempts = 5;
let reconnectTimeout: NodeJS.Timeout | null = null;

// WebSocket message type definitions
interface WebSocketMessage {
  type: string;
  channelId?: number;
  message?: Message;
  messageId?: string;
  status?: string;
  unreadCount?: number;
  channel?: Channel;
}

// Computed values
export const activeChannel = computed(() => {
  const state = chatState.value;
  return state.channels.find((c) => c.id === state.activeChannelId) || null;
});

export const totalUnreadCount = computed(() => {
  return chatState.value.channels.reduce((total, channel) => total + channel.unreadCount, 0);
});

export const activeChannelMessages = computed(() => {
  const channelId = chatState.value.activeChannelId;
  return channelId ? chatState.value.messages[channelId] || [] : [];
});

// WebSocket connection management
export const connectWebSocket = () => {
  if (process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE !== 'true') {
    return;
  }

  // Don't connect if already connected
  if (ws?.readyState === WebSocket.OPEN) {
    return;
  }

  chatState.value = { ...chatState.value, connectionStatus: 'connecting' };

  // Create WebSocket connection
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const wsUrl = `${protocol}//${window.location.host}/api/chat/ws`;

  ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log('Chat WebSocket connected');
    chatState.value = { ...chatState.value, connectionStatus: 'connected' };
    reconnectAttempts = 0;
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
    }
  };

  ws.onclose = (event) => {
    console.log('Chat WebSocket disconnected:', event.code, event.reason);
    chatState.value = { ...chatState.value, connectionStatus: 'disconnected' };

    // Auto-reconnect with exponential backoff
    if (!event.wasClean && reconnectAttempts < maxReconnectAttempts) {
      const delay = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
      reconnectAttempts++;

      reconnectTimeout = setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttempts}/${maxReconnectAttempts})`);
        connectWebSocket();
      }, delay);
    }
  };

  ws.onerror = (error) => {
    console.error('Chat WebSocket error:', error);
    chatState.value = { ...chatState.value, connectionStatus: 'error' };
  };
};

export const disconnectWebSocket = () => {
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }

  if (ws) {
    ws.close(1000, 'Client disconnect');
    ws = null;
  }

  chatState.value = { ...chatState.value, connectionStatus: 'disconnected' };
};

// Handle incoming WebSocket messages
const handleWebSocketMessage = (data: WebSocketMessage) => {
  switch (data.type) {
    case 'new_message':
      if (data.channelId && data.message) {
        addMessage(data.channelId, data.message);
        updateChannelPreview(data.channelId, data.message);
      }
      break;

    case 'channel_created':
      if (data.channel) {
        addChannel(data.channel);
      }
      break;

    case 'message_status_update':
      if (data.channelId && data.messageId && data.status) {
        updateMessageStatus(data.channelId, data.messageId, data.status);
      }
      break;

    case 'unread_count_update':
      if (data.channelId && typeof data.unreadCount === 'number') {
        updateUnreadCount(data.channelId, data.unreadCount);
      }
      break;

    default:
      console.log('Unknown WebSocket message type:', data.type);
  }
};

// State management functions
export const loadChannels = async () => {
  try {
    const response = await fetch('/api/chat/messaging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'list_channels' }),
    });

    if (response.ok) {
      const data = await response.json();
      chatState.value = {
        ...chatState.value,
        channels: data.channels,
        isInitialized: true,
      };
    }
  } catch (error) {
    console.error('Failed to load channels:', error);
  }
};

export const loadMessages = async (channelId: number) => {
  try {
    const response = await fetch('/api/chat/messaging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'get_messages',
        channelId,
        maxResults: 50,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      chatState.value = {
        ...chatState.value,
        messages: {
          ...chatState.value.messages,
          [channelId]: data.messages,
        },
      };

      // Mark messages as read
      await markAsRead(channelId);
    }
  } catch (error) {
    console.error('Failed to load messages:', error);
  }
};

export const sendMessage = async (channelId: number, content: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/chat/messaging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'send_message',
        channelId,
        content: content.trim(),
        messageType: 'STANDARD',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.success;
    }
    return false;
  } catch (error) {
    console.error('Failed to send message:', error);
    return false;
  }
};

export const createChannel = async (
  therapistId: number,
  prospectUserId: number,
): Promise<boolean> => {
  try {
    const response = await fetch('/api/chat/messaging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create_channel',
        therapistId,
        prospectUserId,
        channelName: 'Therapy Session Chat',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        await loadChannels(); // Reload channels to get the new one
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to create channel:', error);
    return false;
  }
};

export const setActiveChannel = (channelId: number | null) => {
  chatState.value = { ...chatState.value, activeChannelId: channelId };

  if (channelId && !chatState.value.messages[channelId]) {
    loadMessages(channelId);
  }
};

const markAsRead = async (channelId: number) => {
  try {
    await fetch('/api/chat/messaging', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'mark_read',
        channelId,
      }),
    });
  } catch (error) {
    console.error('Failed to mark as read:', error);
  }
};

// Helper functions for WebSocket message handling
const addMessage = (channelId: number, message: Message) => {
  const currentMessages = chatState.value.messages[channelId] || [];
  chatState.value = {
    ...chatState.value,
    messages: {
      ...chatState.value.messages,
      [channelId]: [...currentMessages, message],
    },
  };
};

const addChannel = (channel: Channel) => {
  const currentChannels = chatState.value.channels;
  if (!currentChannels.find((c) => c.id === channel.id)) {
    chatState.value = {
      ...chatState.value,
      channels: [...currentChannels, channel],
    };
  }
};

const updateChannelPreview = (channelId: number, message: Message) => {
  const channels = chatState.value.channels.map((channel) => {
    if (channel.id === channelId) {
      return {
        ...channel,
        lastMessageAt: message.sentAt,
        lastMessagePreview:
          message.content.substring(0, 50) + (message.content.length > 50 ? '...' : ''),
        unreadCount: channel.id === chatState.value.activeChannelId ? 0 : channel.unreadCount + 1,
      };
    }
    return channel;
  });

  chatState.value = { ...chatState.value, channels };
};

const updateMessageStatus = (channelId: number, messageId: string, status: string) => {
  const channelMessages = chatState.value.messages[channelId];
  if (!channelMessages) return;

  const updatedMessages = channelMessages.map((msg) =>
    msg.messageId === messageId ? { ...msg, status } : msg,
  );

  chatState.value = {
    ...chatState.value,
    messages: {
      ...chatState.value.messages,
      [channelId]: updatedMessages,
    },
  };
};

const updateUnreadCount = (channelId: number, unreadCount: number) => {
  const channels = chatState.value.channels.map((channel) =>
    channel.id === channelId ? { ...channel, unreadCount } : channel,
  );

  chatState.value = { ...chatState.value, channels };
};

// Initialize chat when the module loads
export const initializeChat = () => {
  if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE === 'true') {
    loadChannels();
    connectWebSocket();

    // Connect WebSocket when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && chatState.value.connectionStatus === 'disconnected') {
        connectWebSocket();
      }
    });

    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      disconnectWebSocket();
    });
  }
};
