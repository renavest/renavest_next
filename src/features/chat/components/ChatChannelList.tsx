import { Clock, MessageCircle, Heart, User } from 'lucide-react';

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

interface ChatChannelListProps {
  channels: Channel[];
  activeChannelId: number | null;
  onSelectChannel: (channel: Channel) => void;
  formatTime: (timestamp: string | number) => string;
}

// Helper function to get display name - same logic as ChatMessageArea
const getChannelDisplayName = (channel: Channel) => {
  // If it's a therapist (has therapistName), show therapist name
  if (channel.therapistName) {
    return channel.therapistName;
  }
  // Otherwise show prospect name
  if (channel.prospectFirstName || channel.prospectLastName) {
    return `${channel.prospectFirstName || ''} ${channel.prospectLastName || ''}`.trim();
  }
  return 'Unnamed Conversation';
};

export function ChatChannelList({
  channels,
  activeChannelId,
  onSelectChannel,
  formatTime,
}: ChatChannelListProps) {
  return (
    <div className='h-full flex flex-col bg-gradient-to-b from-purple-50/20 to-white'>
      {/* Header */}
      <div className='p-3 lg:p-4 border-b border-purple-100 bg-gradient-to-r from-purple-50/30 to-white flex-shrink-0'>
        <div className='flex items-center space-x-2 lg:space-x-3 mb-1 lg:mb-2'>
          <div className='w-6 h-6 lg:w-8 lg:h-8 bg-gradient-to-br from-[#9071FF] to-purple-600 rounded-full flex items-center justify-center'>
            <MessageCircle className='h-3 w-3 lg:h-4 lg:w-4 text-white' />
          </div>
          <h4 className='text-sm lg:text-lg font-semibold text-gray-900'>Conversations</h4>
        </div>
        <p className='text-xs lg:text-sm text-gray-600 flex items-center'>
          <Heart className='h-2 w-2 lg:h-3 lg:w-3 mr-1 text-[#9071FF]/60' />
          <span className='hidden lg:inline'>Connecting through meaningful dialogue</span>
          <span className='lg:hidden'>Active chats</span>
        </p>
      </div>

      {/* Conversations List */}
      <div className='flex-1 p-2 lg:p-3 overflow-hidden'>
        <div className='space-y-1 lg:space-y-2 h-full overflow-y-auto'>
          {channels.map((channel) => {
            const isActive = activeChannelId === channel.id;
            const displayName = getChannelDisplayName(channel);

            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`p-2 lg:p-3 rounded-lg cursor-pointer transition-all duration-300 hover:shadow-sm group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#9071FF] to-purple-600 text-white shadow-lg'
                    : 'bg-white hover:bg-purple-50/50 border border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-2 lg:space-x-3 flex-1 min-w-0'>
                    <div
                      className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-gradient-to-br from-[#9071FF]/10 to-purple-100 text-[#9071FF]'
                      }`}
                    >
                      <User className='h-3 w-3 lg:h-4 lg:w-4' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <p
                        className={`text-sm lg:text-base font-semibold truncate ${
                          isActive ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {displayName}
                      </p>
                      <div className='flex items-center space-x-1 lg:space-x-2 mt-1'>
                        <Clock
                          className={`h-3 w-3 ${isActive ? 'text-purple-200' : 'text-gray-400'}`}
                        />
                        <span
                          className={`text-xs ${isActive ? 'text-purple-200' : 'text-gray-500'}`}
                        >
                          {channel.lastMessageAt ? formatTime(channel.lastMessageAt) : 'Never'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Unread Count Badge */}
                  {channel.unreadCount > 0 && (
                    <div className='flex-shrink-0 ml-2'>
                      <span
                        className={`inline-flex items-center justify-center w-5 h-5 lg:w-6 lg:h-6 text-xs font-bold rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-white text-[#9071FF]'
                            : 'bg-gradient-to-br from-red-500 to-red-600 text-white'
                        }`}
                      >
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Message preview - hidden on mobile for compact layout */}
                <p
                  className={`text-xs lg:text-sm truncate mt-1 lg:mt-2 hidden lg:block ${
                    isActive ? 'text-purple-100' : 'text-gray-600'
                  }`}
                >
                  {channel.lastMessagePreview || 'No messages yet'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Empty state for no conversations */}
        {channels.length === 0 && (
          <div className='text-center py-8'>
            <div className='w-12 h-12 bg-gradient-to-br from-[#9071FF]/10 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse-purple'>
              <MessageCircle className='h-6 w-6 text-[#9071FF]/60' />
            </div>
            <p className='text-sm text-gray-500 mb-1'>No conversations yet</p>
            <p className='text-xs text-gray-400'>
              Clients will appear here when they start chatting
            </p>
            <div className='mt-3 flex items-center justify-center text-xs text-[#9071FF]/70'>
              <Heart className='h-3 w-3 mr-1' />
              <span>Ready to connect</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
