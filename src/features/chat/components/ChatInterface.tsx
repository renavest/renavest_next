'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';

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

interface ChatInterfaceProps {
  therapistId?: number;
  prospectUserId?: number;
  userRole?: 'therapist' | 'prospect';
}

export default function ChatInterface({
  therapistId,
  prospectUserId,
  userRole,
}: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load channels when chat opens
  useEffect(() => {
    if (isOpen) {
      loadChannels();
    }
  }, [isOpen]);

  // Auto-refresh messages every 30 seconds when channel is active
  useEffect(() => {
    if (activeChannel) {
      const interval = setInterval(() => {
        loadMessages(activeChannel.id);
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [activeChannel]);

  const loadChannels = async () => {
    try {
      const response = await fetch('/api/chat/messaging', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_channels' }),
      });

      if (response.ok) {
        const data = await response.json();
        setChannels(data.channels);

        // If we have a therapist and prospect, try to create/find the channel
        if (therapistId && prospectUserId && data.channels.length === 0) {
          await createChannel();
        }
      }
    } catch (error) {
      console.error('Failed to load channels:', error);
    }
  };

  const createChannel = async () => {
    if (!therapistId || !prospectUserId) return;

    try {
      setLoading(true);
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
        }
      }
    } catch (error) {
      console.error('Failed to create channel:', error);
    } finally {
      setLoading(false);
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

        // Mark messages as read
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
          await loadMessages(activeChannel.id); // Reload messages
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

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE !== 'true') {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-colors z-40'
        aria-label='Toggle Chat'
      >
        <MessageCircle size={24} />
        {channels.some((channel) => channel.unreadCount > 0) && (
          <div className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center'>
            {channels.reduce((total, channel) => total + channel.unreadCount, 0)}
          </div>
        )}
      </button>

      {/* Chat Interface */}
      {isOpen && (
        <div className='fixed bottom-24 right-6 w-96 h-[500px] bg-white border border-gray-300 rounded-lg shadow-xl z-50 flex flex-col'>
          {/* Header */}
          <div className='bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center'>
            <h3 className='font-semibold'>
              {activeChannel
                ? userRole === 'therapist'
                  ? `${activeChannel.prospectFirstName} ${activeChannel.prospectLastName}`
                  : activeChannel.therapistName
                : 'Chat'}
            </h3>
            <button onClick={() => setIsOpen(false)} className='text-white hover:text-gray-200'>
              <X size={20} />
            </button>
          </div>

          {/* Content */}
          <div className='flex-1 flex flex-col'>
            {!activeChannel ? (
              /* Channel List */
              <div className='flex-1 p-4'>
                <h4 className='font-medium mb-3'>Conversations</h4>
                {channels.length === 0 ? (
                  <div className='text-center text-gray-500 py-8'>
                    {therapistId && prospectUserId ? (
                      <button
                        onClick={createChannel}
                        disabled={loading}
                        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50'
                      >
                        {loading ? 'Starting...' : 'Start Conversation'}
                      </button>
                    ) : (
                      'No conversations yet'
                    )}
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {channels.map((channel) => (
                      <button
                        key={channel.id}
                        onClick={() => selectChannel(channel)}
                        className='w-full text-left p-3 border rounded hover:bg-gray-50 relative'
                      >
                        <div className='font-medium'>
                          {userRole === 'therapist'
                            ? `${channel.prospectFirstName} ${channel.prospectLastName}`
                            : channel.therapistName}
                        </div>
                        <div className='text-sm text-gray-500 truncate'>
                          {channel.lastMessagePreview || 'No messages yet'}
                        </div>
                        {channel.unreadCount > 0 && (
                          <div className='absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center'>
                            {channel.unreadCount}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              /* Message Interface */
              <>
                {/* Back Button */}
                <div className='p-2 border-b'>
                  <button
                    onClick={() => setActiveChannel(null)}
                    className='text-blue-600 hover:text-blue-800 text-sm'
                  >
                    ← Back to conversations
                  </button>
                </div>

                {/* Messages */}
                <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderEmail === (userRole === 'therapist' ? activeChannel.prospectEmail : 'therapist') ? 'justify-start' : 'justify-end'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.senderEmail ===
                          (userRole === 'therapist' ? activeChannel.prospectEmail : 'therapist')
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-blue-600 text-white'
                        }`}
                      >
                        <div className='text-sm'>{message.content}</div>
                        <div className='text-xs opacity-75 mt-1'>{formatTime(message.sentAt)}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className='p-4 border-t'>
                  <div className='flex space-x-2'>
                    <input
                      type='text'
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      placeholder='Type a message...'
                      className='flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      disabled={loading}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      className='bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 disabled:opacity-50'
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
