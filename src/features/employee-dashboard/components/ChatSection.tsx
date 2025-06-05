'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, User, Clock } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

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

export default function ChatSection() {
  const { user } = useUser();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load channels on component mount
  useEffect(() => {
    loadChannels();
  }, []);

  // Auto-refresh messages every 5 seconds when channel is active
  useEffect(() => {
    if (activeChannel) {
      const interval = setInterval(() => {
        loadMessages(activeChannel.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [activeChannel]);

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

  const loadMessages = async (channelId: number) => {
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
        setMessages(data.messages);
        await markAsRead(channelId);
      }
    } catch (error) {
      console.error('Failed to load messages:', error);
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

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeChannel || loading) return;

    try {
      setLoading(true);
      const response = await fetch('/api/chat/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_message',
          channelId: activeChannel.id,
          content: newMessage.trim(),
          messageType: 'STANDARD',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setNewMessage('');
          await loadMessages(activeChannel.id);
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectChannel = async (channel: Channel) => {
    setActiveChannel(channel);
    await loadMessages(channel.id);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isMyMessage = (message: Message) => {
    return message.senderEmail === user?.emailAddresses?.[0]?.emailAddress;
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

  return (
    <div className='bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100'>
      <div className='p-6'>
        <h3 className='text-xl font-semibold text-gray-800 mb-4 flex items-center'>
          <span className='bg-green-100 p-2 rounded-lg mr-3'>
            <MessageCircle className='h-5 w-5 text-green-600' />
          </span>
          Messages
          {channels.some((channel) => channel.unreadCount > 0) && (
            <span className='ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full'>
              {channels.reduce((total, channel) => total + channel.unreadCount, 0)}
            </span>
          )}
        </h3>

        {!activeChannel ? (
          /* Channel List */
          <div className='space-y-3'>
            {channels.map((channel) => (
              <button
                key={channel.id}
                onClick={() => selectChannel(channel)}
                className='w-full text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors relative'
              >
                <div className='flex items-start space-x-3'>
                  <div className='bg-purple-100 p-2 rounded-full'>
                    <User className='h-4 w-4 text-purple-600' />
                  </div>
                  <div className='flex-1 min-w-0'>
                    <div className='font-medium text-gray-900'>{channel.therapistName}</div>
                    <p className='text-sm text-gray-500 truncate'>
                      {channel.lastMessagePreview || 'No messages yet'}
                    </p>
                    <div className='flex items-center mt-1 text-xs text-gray-400'>
                      <Clock className='h-3 w-3 mr-1' />
                      {new Date(channel.lastMessageAt).toLocaleDateString()}
                    </div>
                  </div>
                  {channel.unreadCount > 0 && (
                    <div className='bg-red-500 text-white text-xs px-2 py-1 rounded-full min-w-0'>
                      {channel.unreadCount}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        ) : (
          /* Message Interface */
          <div className='space-y-4'>
            {/* Back Button */}
            <button
              onClick={() => setActiveChannel(null)}
              className='text-purple-600 hover:text-purple-800 text-sm font-medium'
            >
              ← Back to conversations
            </button>

            {/* Active Conversation Header */}
            <div className='bg-purple-50 rounded-lg p-4 border border-purple-200'>
              <div className='flex items-center space-x-3'>
                <div className='bg-purple-100 p-2 rounded-full'>
                  <User className='h-5 w-5 text-purple-600' />
                </div>
                <div>
                  <h4 className='font-semibold text-gray-900'>{activeChannel.therapistName}</h4>
                  <p className='text-sm text-gray-500'>
                    {activeChannel.therapistTitle || 'Financial Therapist'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className='h-80 overflow-y-auto bg-gray-50 rounded-lg p-4 space-y-3'>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${isMyMessage(message) ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      isMyMessage(message)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white border border-gray-200 text-gray-800'
                    }`}
                  >
                    <div className='text-sm'>{message.content}</div>
                    <div
                      className={`text-xs mt-1 ${isMyMessage(message) ? 'text-purple-200' : 'text-gray-500'}`}
                    >
                      {formatTime(message.sentAt)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className='flex space-x-3'>
              <input
                type='text'
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder='Type your message...'
                className='flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || loading}
                className='bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                <Send className='h-5 w-5' />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
