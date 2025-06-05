'use client';

import { useUser } from '@clerk/nextjs';
import { Send, MessageCircle, User, Clock } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

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

export default function ChatSection() {
  const { user } = useUser();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the new SSE-based chat hook
  const { messages, connectionStatus, sendMessage } = useChat(activeChannelId);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load channels on component mount
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

  const selectChannel = (channel: Channel) => {
    setActiveChannelId(channel.id);
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

  if (channels.length === 0) {
    return (
      <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100'>
        <div className='p-6'>
          <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
            <span className='bg-green-100 p-2 rounded-lg mr-3'>
              <MessageCircle className='h-5 w-5 text-green-600' />
            </span>
            Messages
            {connectionStatus === 'connected' && (
              <span className='ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse'></span>
            )}
            {connectionStatus === 'connecting' && (
              <span className='ml-2 h-2 w-2 bg-yellow-500 rounded-full animate-pulse'></span>
            )}
            {connectionStatus === 'error' && (
              <span className='ml-2 h-2 w-2 bg-red-500 rounded-full'></span>
            )}
          </h3>
          <div className='text-center py-8'>
            <MessageCircle className='h-12 w-12 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500'>No conversations yet</p>
            <p className='text-sm text-gray-400 mt-2'>
              Your therapist conversations will appear here
            </p>
          </div>
        </div>
      </div>
    );
  }

  const activeChannel = channels.find((c) => c.id === activeChannelId);
  const totalUnreadCount = channels.reduce((total, channel) => total + channel.unreadCount, 0);

  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100'>
      <div className='p-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='bg-green-100 p-2 rounded-lg mr-3'>
            <MessageCircle className='h-5 w-5 text-green-600' />
          </span>
          Messages
          {connectionStatus === 'connected' && (
            <span
              className='ml-2 h-2 w-2 bg-green-500 rounded-full animate-pulse'
              title='Connected'
            ></span>
          )}
          {connectionStatus === 'connecting' && (
            <span
              className='ml-2 h-2 w-2 bg-yellow-500 rounded-full animate-pulse'
              title='Connecting'
            ></span>
          )}
          {connectionStatus === 'error' && (
            <span className='ml-2 h-2 w-2 bg-red-500 rounded-full' title='Connection Error'></span>
          )}
          {totalUnreadCount > 0 && (
            <span className='ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
              {totalUnreadCount}
            </span>
          )}
        </h3>

        <div className='flex h-96'>
          {/* Channel List */}
          <div className='w-1/3 border-r border-gray-200 pr-4'>
            <h4 className='text-sm font-medium text-gray-700 mb-3'>Conversations</h4>
            <div className='space-y-2 max-h-80 overflow-y-auto'>
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => selectChannel(channel)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
                    activeChannelId === channel.id
                      ? 'bg-green-50 border border-green-200'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <div className='flex items-start justify-between'>
                    <div className='flex-1 min-w-0'>
                      <p className='text-sm font-medium text-gray-900 truncate'>
                        {channel.therapistName || channel.prospectFirstName
                          ? `${channel.therapistName || ''} ${channel.prospectFirstName || ''} ${channel.prospectLastName || ''}`.trim()
                          : 'Unnamed Conversation'}
                      </p>
                      <p className='text-xs text-gray-500 truncate mt-1'>
                        {channel.lastMessagePreview || 'No messages yet'}
                      </p>
                      <div className='flex items-center mt-1'>
                        <Clock className='h-3 w-3 text-gray-400 mr-1' />
                        <span className='text-xs text-gray-400'>
                          {channel.lastMessageAt ? formatTime(channel.lastMessageAt) : 'Never'}
                        </span>
                      </div>
                    </div>
                    {channel.unreadCount > 0 && (
                      <span className='bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2'>
                        {channel.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          <div className='flex-1 flex flex-col pl-4'>
            {activeChannel ? (
              <>
                <div className='border-b border-gray-200 pb-3 mb-4'>
                  <div className='flex items-center'>
                    <User className='h-5 w-5 text-gray-400 mr-2' />
                    <h4 className='text-lg font-medium text-gray-900'>
                      {activeChannel.therapistName || activeChannel.prospectFirstName
                        ? `${activeChannel.therapistName || ''} ${activeChannel.prospectFirstName || ''} ${activeChannel.prospectLastName || ''}`.trim()
                        : 'Conversation'}
                    </h4>
                    {connectionStatus !== 'connected' && (
                      <span className='ml-2 text-xs text-gray-500'>({connectionStatus})</span>
                    )}
                  </div>
                </div>

                <div className='flex-1 overflow-y-auto mb-4 space-y-3'>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          isMyMessage(message)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className='text-sm'>{message.text}</p>
                        <p
                          className={`text-xs mt-1 ${
                            isMyMessage(message) ? 'text-green-100' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(message.ts)}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='Type a message...'
                    className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
                    disabled={loading || connectionStatus !== 'connected'}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={loading || !newMessage.trim() || connectionStatus !== 'connected'}
                    className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
                  >
                    <Send className='h-4 w-4' />
                  </button>
                </div>
              </>
            ) : (
              <div className='flex-1 flex items-center justify-center text-gray-500'>
                <div className='text-center'>
                  <MessageCircle className='h-8 w-8 mx-auto mb-2 text-gray-300' />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
