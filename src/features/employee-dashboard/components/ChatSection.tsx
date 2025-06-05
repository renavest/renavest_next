'use client';

import { useUser } from '@clerk/nextjs';
import { MessageCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { ChatChannelList } from '@/src/features/chat/components/ChatChannelList';
import { ChatMessageArea } from '@/src/features/chat/components/ChatMessageArea';
import { useChat } from '@/src/features/chat/hooks/useChat';

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

function ConnectionStatusIndicator({
  connectionStatus,
}: {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
}) {
  if (connectionStatus === 'connected') {
    return (
      <span
        className='ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse'
        title='Connected'
      ></span>
    );
  }
  if (connectionStatus === 'connecting') {
    return (
      <span
        className='ml-2 h-2 w-2 bg-yellow-500 rounded-full animate-pulse'
        title='Connecting'
      ></span>
    );
  }
  if (connectionStatus === 'error') {
    return <span className='ml-2 h-2 w-2 bg-red-500 rounded-full' title='Connection Error'></span>;
  }
  return null;
}

export default function ChatSection() {
  const { user } = useUser();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const { messages, connectionStatus, sendMessage } = useChat(activeChannelId);

  useEffect(() => {
    loadChannels();
  }, []);

  const loadChannels = async () => {
    if (process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE !== 'true') return;

    try {
      const response = await fetch('/api/chat/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_channels' }),
      });

      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels);
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeChannelId || loading) return;

    const authorName =
      user?.firstName && user?.lastName
        ? `${user.firstName} ${user.lastName}`
        : user?.emailAddresses?.[0]?.emailAddress || 'Anonymous';

    try {
      setLoading(true);
      const success = await sendMessage(newMessage.trim(), authorName);
      if (success) {
        setNewMessage('');
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string | number) => {
    const date = typeof timestamp === 'number' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: { authorEmail: string }) => {
    return message.authorEmail === user?.emailAddresses?.[0]?.emailAddress;
  };

  if (process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE !== 'true') {
    return null;
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const totalUnreadCount = channels.reduce((total, channel) => total + channel.unreadCount, 0);

  if (channels.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100'>
        <div className='p-4 md:p-6'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
            <span className='bg-green-100 p-2 rounded-lg mr-3'>
              <MessageCircle className='h-5 w-5 text-green-600' />
            </span>
            Messages
            <ConnectionStatusIndicator connectionStatus={connectionStatus} />
          </h3>
          <div className='h-[600px] md:h-[500px] bg-gray-50 rounded-xl border border-gray-200 flex items-center justify-center'>
            <div className='text-center py-8'>
              <MessageCircle className='h-12 w-12 text-gray-300 mx-auto mb-4' />
              <p className='text-gray-500'>No conversations yet</p>
              <p className='text-sm text-gray-400 mt-2'>
                Your therapist conversations will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100'>
      <div className='p-4 md:p-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='bg-green-100 p-2 rounded-lg mr-3'>
            <MessageCircle className='h-5 w-5 text-green-600' />
          </span>
          Messages
          <ConnectionStatusIndicator connectionStatus={connectionStatus} />
          {totalUnreadCount > 0 && (
            <span className='ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
              {totalUnreadCount}
            </span>
          )}
        </h3>

        <div className='flex flex-col lg:flex-row h-[600px] md:h-[500px] bg-gray-50 rounded-xl border border-gray-200 overflow-hidden'>
          {/* Conversations List - Responsive Width */}
          <div className='lg:w-1/3 xl:w-1/4 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 flex-shrink-0 h-48 lg:h-full overflow-hidden'>
            <ChatChannelList
              channels={channels}
              activeChannelId={activeChannelId}
              onSelectChannel={(channel) => setActiveChannelId(channel.id)}
              formatTime={formatTime}
            />
          </div>

          {/* Chat Area - Takes Remaining Space */}
          <div className='flex-1 bg-white min-h-0'>
            <ChatMessageArea
              activeChannel={activeChannel || null}
              messages={messages}
              newMessage={newMessage}
              loading={loading}
              connectionStatus={connectionStatus}
              onMessageChange={setNewMessage}
              onSendMessage={handleSendMessage}
              onKeyPress={handleKeyPress}
              isMyMessage={isMyMessage}
              formatTime={formatTime}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
