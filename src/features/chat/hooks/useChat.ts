import { useState, useEffect, useCallback } from 'react';

import { type ChatMessage } from '@/src/lib/redis';

interface Message {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  channelId: number;
  ts: number;
  messageType?: string;
}

export function useChat(channelId: number | null) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<
    'disconnected' | 'connecting' | 'connected' | 'error'
  >('disconnected');

  useEffect(() => {
    if (!channelId || process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE !== 'true') {
      setMessages([]);
      setConnectionStatus('disconnected');
      return;
    }

    console.log(`Connecting to SSE for channel ${channelId}`);
    setConnectionStatus('connecting');
    setMessages([]); // Clear messages when switching channels

    const eventSource = new EventSource(`/api/chat/${channelId}`);

    eventSource.onopen = () => {
      console.log(`SSE connected for channel ${channelId}`);
      setConnectionStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // Handle connection confirmation
        if (data.type === 'connected') {
          console.log(`Confirmed connection to channel ${data.channelId}`);
          return;
        }

        // Handle chat messages
        if (data.id && data.text && data.channelId === channelId) {
          console.log('Received message:', data);
          setMessages((prevMessages) => {
            // Avoid duplicates
            if (prevMessages.some((msg) => msg.id === data.id)) {
              return prevMessages;
            }
            return [...prevMessages, data].sort((a, b) => a.ts - b.ts);
          });
        }
      } catch (error) {
        console.error('Failed to parse SSE message:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE error for channel', channelId, error);
      setConnectionStatus('error');
    };

    return () => {
      console.log(`Closing SSE connection for channel ${channelId}`);
      eventSource.close();
      setConnectionStatus('disconnected');
    };
  }, [channelId]);

  const sendMessage = useCallback(
    async (text: string, author: string): Promise<boolean> => {
      if (!channelId || !text.trim()) return false;

      try {
        const response = await fetch('/api/chat/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            channelId,
            content: text.trim(),
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
    },
    [channelId],
  );

  return {
    messages,
    connectionStatus,
    sendMessage,
  };
}
