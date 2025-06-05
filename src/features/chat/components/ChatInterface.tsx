'use client';

import { Send, MessageCircle, X, RefreshCw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

import type { ChatInterfaceProps } from '@/src/features/chat/types';

import {
  chatState,
  activeChannel,
  activeChannelMessages,
  totalUnreadCount,
  loadChannels,
  loadMessages,
  sendMessage,
  setActiveChannel,
  initializeChat,
} from '../state/chatState';

export default function ChatInterface({ therapistId, userRole }: ChatInterfaceProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize chat when component mounts
  useEffect(() => {
    initializeChat();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChannelMessages.value]);

  const handleSendMessage = async () => {
    if (!message.trim() || !activeChannel.value) return;

    const success = await sendMessage(activeChannel.value.id, message);
    if (success) {
      setMessage('');
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadChannels();
    if (activeChannel.value) {
      await loadMessages(activeChannel.value.id);
    }
    setIsRefreshing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (process.env.NEXT_PUBLIC_ENABLE_CHAT_FEATURE !== 'true') {
    return null;
  }

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='fixed bottom-6 right-6 z-50 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-105'
        aria-label='Toggle Chat'
      >
        <MessageCircle className='h-6 w-6' />
        {totalUnreadCount.value > 0 && (
          <span className='absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center'>
            {totalUnreadCount.value}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className='fixed bottom-24 right-6 z-50 w-80 h-96 bg-white rounded-lg shadow-xl border border-gray-200 flex flex-col'>
          {/* Header */}
          <div className='flex items-center justify-between p-4 border-b border-gray-200 bg-purple-50 rounded-t-lg'>
            <h3 className='font-semibold text-gray-800'>Chat</h3>
            <div className='flex items-center gap-2'>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className='p-1 hover:bg-purple-100 rounded transition-colors'
                aria-label='Refresh'
              >
                <RefreshCw
                  className={`h-4 w-4 text-gray-600 ${isRefreshing ? 'animate-spin' : ''}`}
                />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className='p-1 hover:bg-purple-100 rounded transition-colors'
                aria-label='Close'
              >
                <X className='h-4 w-4 text-gray-600' />
              </button>
            </div>
          </div>

          {/* Content */}
          {!chatState.value.isInitialized ? (
            <div className='flex-1 flex items-center justify-center'>
              <div className='text-gray-500'>Loading chat...</div>
            </div>
          ) : chatState.value.channels.length === 0 ? (
            <div className='flex-1 flex items-center justify-center text-center p-4'>
              <div className='text-gray-500'>
                <MessageCircle className='h-8 w-8 mx-auto mb-2 opacity-50' />
                <p>No chat conversations yet</p>
                <p className='text-sm mt-1'>
                  Start chatting with {userRole === 'therapist' ? 'clients' : 'a therapist'}!
                </p>
              </div>
            </div>
          ) : !activeChannel.value ? (
            <div className='flex-1 flex flex-col'>
              {/* Channel List */}
              <div className='flex-1 overflow-y-auto p-2'>
                {chatState.value.channels.map((channel) => (
                  <button
                    key={channel.id}
                    onClick={() => setActiveChannel(channel.id)}
                    className='w-full text-left p-3 rounded-lg hover:bg-gray-50 border-b border-gray-100 last:border-b-0'
                  >
                    <div className='flex items-center justify-between'>
                      <div className='font-medium text-sm'>
                        {userRole === 'therapist'
                          ? `${channel.prospectFirstName} ${channel.prospectLastName}`
                          : channel.therapistName}
                      </div>
                      {channel.unreadCount > 0 && (
                        <span className='bg-red-500 text-white text-xs rounded-full px-2 py-1'>
                          {channel.unreadCount}
                        </span>
                      )}
                    </div>
                    {channel.lastMessagePreview && (
                      <div className='text-xs text-gray-500 mt-1 truncate'>
                        {channel.lastMessagePreview}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex-1 flex flex-col'>
              {/* Chat Header */}
              <div className='p-3 border-b border-gray-100 bg-gray-50'>
                <button
                  onClick={() => setActiveChannel(null)}
                  className='text-sm text-purple-600 hover:text-purple-700 mb-1'
                >
                  ← Back to conversations
                </button>
                <div className='font-medium text-sm'>
                  {userRole === 'therapist'
                    ? `${activeChannel.value.prospectFirstName} ${activeChannel.value.prospectLastName}`
                    : activeChannel.value.therapistName}
                </div>
              </div>

              {/* Messages */}
              <div className='flex-1 overflow-y-auto p-3 space-y-2'>
                {activeChannelMessages.value.map((msg) => {
                  const isOwnMessage =
                    userRole === 'therapist'
                      ? msg.senderEmail !== activeChannel.value?.prospectEmail
                      : msg.senderEmail === activeChannel.value?.prospectEmail;

                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                          isOwnMessage ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div>{msg.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            isOwnMessage ? 'text-purple-200' : 'text-gray-500'
                          }`}
                        >
                          {formatTime(msg.sentAt)}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className='p-3 border-t border-gray-100'>
                <div className='flex gap-2'>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder='Type a message...'
                    className='flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent'
                    rows={1}
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    className='bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 text-white rounded-lg px-3 py-2 transition-colors'
                  >
                    <Send className='h-4 w-4' />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
