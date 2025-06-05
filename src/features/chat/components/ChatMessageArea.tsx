import { useRef, useEffect } from 'react';
import { Send, User, MessageCircle } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  author: string;
  authorEmail: string;
  channelId: number;
  ts: number;
  messageType?: string;
}

interface Channel {
  id: number;
  therapistName?: string;
  prospectFirstName?: string;
  prospectLastName?: string;
}

interface ChatMessageAreaProps {
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
}

export function ChatMessageArea({
  activeChannel,
  messages,
  newMessage,
  loading,
  connectionStatus,
  onMessageChange,
  onSendMessage,
  onKeyPress,
  isMyMessage,
  formatTime,
}: ChatMessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChannel) {
    return (
      <div className='flex-1 flex items-center justify-center text-gray-500'>
        <div className='text-center'>
          <MessageCircle className='h-8 w-8 mx-auto mb-2 text-gray-300' />
          <p>Select a conversation to start messaging</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex-1 flex flex-col pl-4'>
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
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={onKeyPress}
          placeholder='Type a message...'
          className='flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500'
          disabled={loading || connectionStatus !== 'connected'}
        />
        <button
          onClick={onSendMessage}
          disabled={loading || !newMessage.trim() || connectionStatus !== 'connected'}
          className='px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
        >
          <Send className='h-4 w-4' />
        </button>
      </div>
    </div>
  );
} 