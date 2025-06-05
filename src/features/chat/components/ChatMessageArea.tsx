import { Send, User, MessageCircle, Loader2, Heart, CheckCircle2, Lightbulb } from 'lucide-react';
import { useRef, useEffect } from 'react';

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

// Connection status utilities
const getConnectionStatusColor = (status: string) => {
  switch (status) {
    case 'connected':
      return 'text-emerald-600 bg-emerald-50';
    case 'connecting':
      return 'text-yellow-600 bg-yellow-50';
    case 'error':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getConnectionStatusIcon = (status: string) => {
  switch (status) {
    case 'connected':
      return <CheckCircle2 className='h-3 w-3' />;
    case 'connecting':
      return <Loader2 className='h-3 w-3 animate-spin' />;
    case 'error':
      return <div className='h-3 w-3 bg-red-500 rounded-full' />;
    default:
      return <div className='h-3 w-3 bg-gray-400 rounded-full' />;
  }
};

// Helper function to get display name - fixes the name repetition issue
const getDisplayName = (channel: Channel) => {
  // If it's a therapist (has therapistName), show therapist name
  if (channel.therapistName) {
    return channel.therapistName;
  }
  // Otherwise show prospect name
  if (channel.prospectFirstName || channel.prospectLastName) {
    return `${channel.prospectFirstName || ''} ${channel.prospectLastName || ''}`.trim();
  }
  return 'Conversation';
};

// Conversation starter prompts for therapists
const conversationStarters = [
  'How are you feeling about your financial situation today?',
  "What's been on your mind regarding money lately?",
  "I'm here to support you - what would you like to explore?",
  'Tell me about your current financial goals or concerns',
  'How has your relationship with money evolved recently?',
];

// Empty state component
const EmptyChannelState = () => (
  <div className='flex-1 flex items-center justify-center'>
    <div className='text-center py-16 px-6'>
      <div className='w-20 h-20 bg-gradient-to-br from-[#9071FF]/10 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse-purple'>
        <MessageCircle className='h-10 w-10 text-[#9071FF]/60' />
      </div>
      <h3 className='text-xl font-semibold text-gray-900 mb-2'>Select a Conversation</h3>
      <p className='text-gray-600 max-w-sm'>
        Choose a conversation from the sidebar to start connecting with your clients
      </p>
      <div className='mt-4 flex items-center justify-center text-sm text-[#9071FF]/70'>
        <Heart className='h-4 w-4 mr-1' />
        <span>Compassionate communication starts here</span>
      </div>
    </div>
  </div>
);

// Chat header component - fixed name display
const ChatHeader = ({
  activeChannel,
  connectionStatus,
}: {
  activeChannel: Channel;
  connectionStatus: string;
}) => (
  <div className='border-b border-purple-100 bg-gradient-to-r from-purple-50/30 to-white p-4'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-3'>
        <div className='w-10 h-10 bg-gradient-to-br from-[#9071FF] to-purple-600 rounded-full flex items-center justify-center shadow-lg'>
          <User className='h-5 w-5 text-white' />
        </div>
        <div>
          <h4 className='text-lg font-semibold text-gray-900'>{getDisplayName(activeChannel)}</h4>
          <div
            className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getConnectionStatusColor(connectionStatus)}`}
          >
            {getConnectionStatusIcon(connectionStatus)}
            <span className='font-medium capitalize'>{connectionStatus}</span>
          </div>
        </div>
      </div>
      <div className='text-xs text-gray-500 bg-white/80 px-3 py-1 rounded-full border border-purple-100'>
        <Heart className='h-3 w-3 inline mr-1 text-[#9071FF]' />
        Safe space for healing
      </div>
    </div>
  </div>
);

// Conversation starter prompts component
const ConversationStarters = ({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) => (
  <div className='border-b border-purple-100 bg-gradient-to-r from-purple-50/20 to-white p-4'>
    <div className='flex items-center space-x-2 mb-3'>
      <Lightbulb className='h-4 w-4 text-[#9071FF]' />
      <h5 className='text-sm font-medium text-gray-700'>Conversation Starters</h5>
    </div>
    <div className='flex flex-wrap gap-2'>
      {conversationStarters.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelectPrompt(prompt)}
          className='text-xs px-3 py-2 bg-white border border-purple-200 rounded-full hover:bg-purple-50 hover:border-[#9071FF] transition-all duration-200 text-gray-700 hover:text-[#9071FF]'
        >
          "{prompt}"
        </button>
      ))}
    </div>
  </div>
);

// Message bubble component
const MessageBubble = ({
  message,
  isMyMessage,
  formatTime,
}: {
  message: Message;
  isMyMessage: boolean;
  formatTime: (timestamp: string | number) => string;
}) => (
  <div className={`flex animate-fade-in-up ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
    <div className={`max-w-xs lg:max-w-md relative group ${isMyMessage ? 'ml-12' : 'mr-12'}`}>
      <div
        className={`px-4 py-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
          isMyMessage
            ? 'bg-gradient-to-br from-[#9071FF] to-purple-600 text-white rounded-br-md'
            : 'bg-white border border-purple-100 text-gray-900 rounded-bl-md hover:border-purple-200'
        }`}
      >
        <p className='text-sm leading-relaxed'>{message.text}</p>
        <div className='flex items-center justify-between mt-2'>
          <p className={`text-xs ${isMyMessage ? 'text-purple-100' : 'text-gray-500'}`}>
            {formatTime(message.ts)}
          </p>
          {isMyMessage && (
            <div className='text-purple-100'>
              <CheckCircle2 className='h-3 w-3' />
            </div>
          )}
        </div>
      </div>

      <div className='opacity-0 group-hover:opacity-100 transition-opacity duration-300 mt-1'>
        <div
          className={`flex items-center space-x-1 ${isMyMessage ? 'justify-end' : 'justify-start'}`}
        >
          <Heart className='h-3 w-3 text-[#9071FF]/40 hover:text-[#9071FF] cursor-pointer transition-colors' />
        </div>
      </div>
    </div>
  </div>
);

// Input area component - reduced gradient intensity
const ChatInput = ({
  newMessage,
  loading,
  connectionStatus,
  onMessageChange,
  onSendMessage,
  onKeyPress,
}: {
  newMessage: string;
  loading: boolean;
  connectionStatus: string;
  onMessageChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
}) => (
  <div className='border-t border-purple-100 bg-gradient-to-r from-white to-purple-50/20 p-4'>
    <div className='flex items-end space-x-3'>
      <div className='flex-1 relative'>
        <textarea
          value={newMessage}
          onChange={(e) => onMessageChange(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              onKeyPress(e);
            }
          }}
          placeholder='Share your thoughts with compassion...'
          rows={1}
          className='w-full px-4 py-3 border border-purple-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#9071FF]/30 focus:border-[#9071FF] resize-none bg-white shadow-sm transition-all duration-300 hover:border-purple-300 text-gray-900 placeholder-gray-500'
          style={{ minHeight: '44px', maxHeight: '120px' }}
          disabled={loading || connectionStatus !== 'connected'}
        />

        {loading && (
          <div className='absolute right-3 bottom-3 flex items-center space-x-1 text-[#9071FF]'>
            <div
              className='w-1 h-1 bg-current rounded-full animate-bounce'
              style={{ animationDelay: '0ms' }}
            ></div>
            <div
              className='w-1 h-1 bg-current rounded-full animate-bounce'
              style={{ animationDelay: '150ms' }}
            ></div>
            <div
              className='w-1 h-1 bg-current rounded-full animate-bounce'
              style={{ animationDelay: '300ms' }}
            ></div>
          </div>
        )}
      </div>

      <button
        onClick={onSendMessage}
        disabled={loading || !newMessage.trim() || connectionStatus !== 'connected'}
        className={`p-3 rounded-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg ${
          loading || !newMessage.trim() || connectionStatus !== 'connected'
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-br from-[#9071FF] to-purple-600 text-white hover:from-[#7c5ce8] hover:to-purple-700 hover:shadow-xl'
        }`}
      >
        {loading ? <Loader2 className='h-5 w-5 animate-spin' /> : <Send className='h-5 w-5' />}
      </button>
    </div>

    <div className='flex items-center justify-between mt-3 text-xs'>
      <div className='flex items-center space-x-2 text-gray-500'>
        <Heart className='h-3 w-3 text-[#9071FF]/60' />
        <span>Creating a space for healing conversations</span>
      </div>
      {connectionStatus !== 'connected' && (
        <div className='text-amber-600 font-medium'>
          {connectionStatus === 'connecting' ? 'Reconnecting...' : 'Connection issue'}
        </div>
      )}
    </div>
  </div>
);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handlePromptSelect = (prompt: string) => {
    onMessageChange(prompt);
  };

  if (!activeChannel) {
    return <EmptyChannelState />;
  }

  return (
    <div className='flex-1 flex flex-col bg-white'>
      <ChatHeader activeChannel={activeChannel} connectionStatus={connectionStatus} />

      {messages.length === 0 && <ConversationStarters onSelectPrompt={handlePromptSelect} />}

      <div className='flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-purple-50/10'>
        {messages.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center py-12'>
              <div className='w-16 h-16 bg-gradient-to-br from-[#9071FF]/10 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-float'>
                <MessageCircle className='h-8 w-8 text-[#9071FF]/60' />
              </div>
              <h3 className='text-lg font-medium text-gray-700 mb-2'>Start Your Conversation</h3>
              <p className='text-sm text-gray-500 max-w-sm'>
                Choose a conversation starter above or send your first message to create a safe
                space for meaningful dialogue.
              </p>
              <div className='mt-4 flex items-center justify-center text-xs text-[#9071FF]/70'>
                <Heart className='h-3 w-3 mr-1' />
                <span>Every conversation is a step toward healing</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isMyMessage={isMyMessage(message)}
                formatTime={formatTime}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      <ChatInput
        newMessage={newMessage}
        loading={loading}
        connectionStatus={connectionStatus}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
        onKeyPress={onKeyPress}
      />
    </div>
  );
}
