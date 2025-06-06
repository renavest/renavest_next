import {
  Send,
  User,
  MessageCircle,
  Loader2,
  Heart,
  CheckCircle2,
  Lightbulb,
  Download,
} from 'lucide-react';
import { useRef, useEffect, useState } from 'react';

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
  showExportButton?: boolean;
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

// Helper function to export chat messages via API for compliance
const exportChatMessages = async (messages: Message[], channel: Channel) => {
  try {
    const response = await fetch(`/api/chat/export?channelId=${channel.id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export chat messages');
    }

    // Get the filename from the Content-Disposition header
    const contentDisposition = response.headers.get('Content-Disposition');
    const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
    const filename = filenameMatch ? filenameMatch[1] : `chat-export-${Date.now()}.txt`;

    // Create blob and download
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting chat:', error);
    alert('Failed to export chat messages. Please try again.');
  }
};

// Chat header component - fixed name display
const ChatHeader = ({
  activeChannel,
  connectionStatus,
  messages,
  onExport,
  showExportButton = false,
}: {
  activeChannel: Channel;
  connectionStatus: string;
  messages: Message[];
  onExport: () => void;
  showExportButton?: boolean;
}) => (
  <div className='border-b border-purple-100 bg-gradient-to-r from-purple-50/30 to-white p-3 lg:p-4'>
    <div className='flex items-center justify-between'>
      <div className='flex items-center space-x-2 lg:space-x-3'>
        <div className='w-8 h-8 lg:w-10 lg:h-10 bg-gradient-to-br from-[#9071FF] to-purple-600 rounded-full flex items-center justify-center shadow-lg'>
          <User className='h-4 w-4 lg:h-5 lg:w-5 text-white' />
        </div>
        <div>
          <h4 className='text-sm lg:text-lg font-semibold text-gray-900'>
            {getDisplayName(activeChannel)}
          </h4>
          <div
            className={`flex items-center space-x-1 text-xs px-2 py-1 rounded-full ${getConnectionStatusColor(connectionStatus)}`}
          >
            {getConnectionStatusIcon(connectionStatus)}
            <span className='font-medium capitalize text-xs lg:text-sm'>{connectionStatus}</span>
          </div>
        </div>
      </div>
      <div className='flex items-center space-x-1 lg:space-x-3'>
        {showExportButton && messages.length > 0 && (
          <button
            onClick={onExport}
            className='flex items-center space-x-1 lg:space-x-2 px-2 py-1.5 lg:px-3 lg:py-2 text-xs lg:text-sm font-medium text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md'
            title='Export chat for compliance'
          >
            <Download className='h-3 w-3 lg:h-4 lg:w-4' />
            <span className='hidden sm:inline'>Export</span>
          </button>
        )}
        <div className='text-xs text-gray-500 bg-white/80 px-2 py-1 lg:px-3 lg:py-1 rounded-full border border-purple-100'>
          <Heart className='h-2 w-2 lg:h-3 lg:w-3 inline mr-1 text-[#9071FF]' />
          <span className='hidden lg:inline'>Safe space for healing</span>
          <span className='lg:hidden'>Safe</span>
        </div>
      </div>
    </div>
  </div>
);

// Conversation starter prompts component
const ConversationStarters = ({ onSelectPrompt }: { onSelectPrompt: (prompt: string) => void }) => (
  <div className='border-b border-purple-100 bg-gradient-to-r from-purple-50/20 to-white p-3 lg:p-4'>
    <div className='flex items-center space-x-2 mb-2 lg:mb-3'>
      <Lightbulb className='h-3 w-3 lg:h-4 lg:w-4 text-[#9071FF]' />
      <h5 className='text-xs lg:text-sm font-medium text-gray-700'>Conversation Starters</h5>
    </div>
    <div className='flex flex-wrap gap-1 lg:gap-2'>
      {conversationStarters.map((prompt, index) => (
        <button
          key={index}
          onClick={() => onSelectPrompt(prompt)}
          className='text-xs px-2 py-1.5 lg:px-3 lg:py-2 bg-white border border-purple-200 rounded-full hover:bg-purple-50 hover:border-[#9071FF] transition-all duration-200 text-gray-700 hover:text-[#9071FF]'
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
    <div
      className={`max-w-[85%] sm:max-w-xs lg:max-w-md relative group ${isMyMessage ? 'ml-6 lg:ml-12' : 'mr-6 lg:mr-12'}`}
    >
      <div
        className={`px-3 py-2 lg:px-4 lg:py-3 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md ${
          isMyMessage
            ? 'bg-gradient-to-br from-[#9071FF] to-purple-600 text-white rounded-br-md'
            : 'bg-white border border-purple-100 text-gray-900 rounded-bl-md hover:border-purple-200'
        }`}
      >
        <p className='text-sm lg:text-base leading-relaxed'>{message.text}</p>
        <div className='flex items-center justify-between mt-1 lg:mt-2'>
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

// Input area component - responsive design
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
  <div className='border-t border-purple-100 bg-gradient-to-r from-white to-purple-50/20 p-3 lg:p-4'>
    <div className='flex items-center space-x-2 lg:space-x-3 w-full'>
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
          className='w-full px-3 lg:px-4 py-2 lg:py-3 border border-purple-200 rounded-lg lg:rounded-xl focus:outline-none focus:ring-2 focus:ring-[#9071FF]/30 focus:border-[#9071FF] resize-none bg-white shadow-sm transition-all duration-300 hover:border-purple-300 text-gray-900 placeholder-gray-500 text-sm lg:text-base'
          style={{ minHeight: '40px', maxHeight: '120px' }}
          disabled={loading || connectionStatus !== 'connected'}
        />

        {loading && (
          <div className='absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-[#9071FF]'>
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
        className={`p-2 lg:p-3 rounded-lg lg:rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg flex-shrink-0 w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center ${
          loading || !newMessage.trim() || connectionStatus !== 'connected'
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
            : 'bg-gradient-to-br from-[#9071FF] to-purple-600 text-white hover:from-[#7c5ce8] hover:to-purple-700 hover:shadow-xl'
        }`}
      >
        {loading ? (
          <Loader2 className='h-4 w-4 lg:h-5 lg:w-5 animate-spin' />
        ) : (
          <Send className='h-4 w-4 lg:h-5 lg:w-5' />
        )}
      </button>
    </div>

    <div className='flex items-center justify-center mt-2 lg:mt-3 text-xs'>
      <div className='flex items-center space-x-2 text-gray-500'>
        <Heart className='h-2 w-2 lg:h-3 lg:w-3 text-[#9071FF]/60' />
        <span className='hidden sm:inline'>Creating a space for healing conversations</span>
        <span className='sm:hidden'>Safe space</span>
      </div>
      {connectionStatus !== 'connected' && (
        <div className='text-amber-600 font-medium ml-4 text-xs lg:text-sm'>
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
  showExportButton = false,
}: ChatMessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [isUserAtBottom, setIsUserAtBottom] = useState(true);
  const [lastMessageCount, setLastMessageCount] = useState(0);

  // Check if user is at bottom of chat
  const checkIfAtBottom = () => {
    if (!messagesContainerRef.current) return false;

    const container = messagesContainerRef.current;
    const threshold = 10; // Reduced threshold for more precise detection
    const scrollBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    return scrollBottom <= threshold;
  };

  // Handle scroll events
  const handleScroll = () => {
    setIsUserAtBottom(checkIfAtBottom());
  };

  // Only auto-scroll if user was at bottom when new messages arrive
  useEffect(() => {
    if (messages.length > lastMessageCount) {
      if (isUserAtBottom) {
        // Use requestAnimationFrame for smoother scrolling and better timing
        requestAnimationFrame(() => {
          if (messagesEndRef.current && messagesContainerRef.current) {
            const container = messagesContainerRef.current;
            const endElement = messagesEndRef.current;

            // Calculate the precise scroll position
            const elementTop = endElement.offsetTop;
            const elementHeight = endElement.offsetHeight;
            const containerHeight = container.clientHeight;

            // Scroll to show the end element at the bottom of the container
            const targetScrollTop = elementTop + elementHeight - containerHeight;

            // Ensure we don't scroll past the maximum scroll position
            const maxScrollTop = container.scrollHeight - container.clientHeight;
            const finalScrollTop = Math.min(targetScrollTop, maxScrollTop);

            container.scrollTo({
              top: finalScrollTop,
              behavior: 'smooth',
            });
          }
        });
      }
      setLastMessageCount(messages.length);
    }
  }, [messages, isUserAtBottom, lastMessageCount]);

  // Reset to bottom when switching channels
  useEffect(() => {
    setIsUserAtBottom(true);
    setLastMessageCount(0);
    requestAnimationFrame(() => {
      if (messagesContainerRef.current) {
        const container = messagesContainerRef.current;
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'auto',
        });
      }
    });
  }, [activeChannel?.id]);

  const handlePromptSelect = (prompt: string) => {
    onMessageChange(prompt);
  };

  if (!activeChannel) {
    return <EmptyChannelState />;
  }

  return (
    <div className='h-full flex flex-col bg-white'>
      <ChatHeader
        activeChannel={activeChannel}
        connectionStatus={connectionStatus}
        messages={messages}
        onExport={() => exportChatMessages(messages, activeChannel)}
        showExportButton={showExportButton}
      />

      {messages.length === 0 && <ConversationStarters onSelectPrompt={handlePromptSelect} />}

      <div
        ref={messagesContainerRef}
        className='flex-1 overflow-y-scroll p-2 lg:p-4 space-y-2 lg:space-y-4 bg-gradient-to-b from-white to-purple-50/10'
        onScroll={handleScroll}
      >
        {messages.length === 0 ? (
          <div className='flex items-center justify-center h-full'>
            <div className='text-center py-8 lg:py-12 px-4'>
              <div className='w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-[#9071FF]/10 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 lg:mb-4 animate-float'>
                <MessageCircle className='h-6 w-6 lg:h-8 lg:w-8 text-[#9071FF]/60' />
              </div>
              <h3 className='text-base lg:text-lg font-medium text-gray-700 mb-2'>
                Start Your Conversation
              </h3>
              <p className='text-sm text-gray-500 max-w-sm mx-auto'>
                Choose a conversation starter above or send your first message to create a safe
                space for meaningful dialogue.
              </p>
              <div className='mt-3 lg:mt-4 flex items-center justify-center text-xs text-[#9071FF]/70'>
                <Heart className='h-2 w-2 lg:h-3 lg:w-3 mr-1' />
                <span className='text-xs lg:text-sm'>
                  Every conversation is a step toward healing
                </span>
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

        {/* Scroll to bottom button - shows when user is not at bottom */}
        {!isUserAtBottom && messages.length > 0 && (
          <div className='fixed bottom-20 lg:bottom-24 right-4 lg:right-8 z-10'>
            <button
              onClick={() => {
                if (messagesContainerRef.current) {
                  const container = messagesContainerRef.current;
                  container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth',
                  });
                  setIsUserAtBottom(true);
                }
              }}
              className='bg-[#9071FF] text-white p-2 lg:p-3 rounded-full shadow-lg hover:bg-[#7c5ce8] transition-all duration-200 hover:scale-105'
              title='Scroll to latest messages'
            >
              <svg
                className='w-4 h-4 lg:w-5 lg:h-5'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M19 14l-7 7m0 0l-7-7m7 7V3'
                />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className='flex-shrink-0'>
        <ChatInput
          newMessage={newMessage}
          loading={loading}
          connectionStatus={connectionStatus}
          onMessageChange={onMessageChange}
          onSendMessage={onSendMessage}
          onKeyPress={onKeyPress}
        />
      </div>
    </div>
  );
}
