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
    <div className='h-full border-r border-purple-100 bg-gradient-to-b from-purple-50/20 to-white'>
      {/* Header */}
      <div className='p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50/30 to-white'>
        <div className='flex items-center space-x-3 mb-3'>
          <div className='w-10 h-10 bg-gradient-to-br from-[#9071FF] to-purple-600 rounded-full flex items-center justify-center'>
            <MessageCircle className='h-5 w-5 text-white' />
          </div>
          <h4 className='text-xl font-semibold text-gray-900'>Conversations</h4>
        </div>
        <p className='text-sm text-gray-600 flex items-center'>
          <Heart className='h-3 w-3 mr-1 text-[#9071FF]/60' />
          Connecting through meaningful dialogue
        </p>
      </div>

      {/* Conversations List */}
      <div className='p-4'>
        <div className='space-y-3 max-h-80 overflow-y-auto'>
          {channels.map((channel) => {
            const isActive = activeChannelId === channel.id;
            const displayName = getChannelDisplayName(channel);

            return (
              <div
                key={channel.id}
                onClick={() => onSelectChannel(channel)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-sm group ${
                  isActive
                    ? 'bg-gradient-to-r from-[#9071FF] to-purple-600 text-white shadow-lg'
                    : 'bg-white hover:bg-purple-50/50 border border-gray-100 hover:border-purple-200'
                }`}
              >
                <div className='flex items-start justify-between'>
                  <div className='flex-1 min-w-0'>
                    {/* Contact Info */}
                    <div className='flex items-center space-x-3 mb-2'>
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-gradient-to-br from-[#9071FF]/10 to-purple-100 text-[#9071FF]'
                        }`}
                      >
                        <User className='h-4 w-4' />
                      </div>
                      <p
                        className={`text-base font-semibold truncate ${
                          isActive ? 'text-white' : 'text-gray-900'
                        }`}
                      >
                        {displayName}
                      </p>
                    </div>

                    {/* Last Message Preview */}
                    <p
                      className={`text-sm truncate mb-3 ml-11 ${
                        isActive ? 'text-purple-100' : 'text-gray-600'
                      }`}
                    >
                      {channel.lastMessagePreview || 'No messages yet'}
                    </p>

                    {/* Timestamp */}
                    <div className='flex items-center ml-11'>
                      <Clock
                        className={`h-4 w-4 mr-2 ${isActive ? 'text-purple-200' : 'text-gray-400'}`}
                      />
                      <span className={`text-sm ${isActive ? 'text-purple-200' : 'text-gray-500'}`}>
                        {channel.lastMessageAt ? formatTime(channel.lastMessageAt) : 'Never'}
                      </span>
                    </div>
                  </div>

                  {/* Unread Count Badge */}
                  {channel.unreadCount > 0 && (
                    <div className={`flex-shrink-0 ml-3 ${isActive ? 'transform scale-110' : ''}`}>
                      <span
                        className={`inline-flex items-center justify-center w-7 h-7 text-sm font-bold rounded-full transition-all duration-300 ${
                          isActive
                            ? 'bg-white text-[#9071FF] animate-pulse-purple'
                            : 'bg-gradient-to-br from-red-500 to-red-600 text-white shadow-sm'
                        }`}
                      >
                        {channel.unreadCount > 99 ? '99+' : channel.unreadCount}
                      </span>
                    </div>
                  )}
                </div>

                {/* Hover indicator for emotional touch */}
                <div
                  className={`mt-3 h-0.5 rounded-full transition-all duration-300 ${
                    isActive
                      ? 'bg-white/30'
                      : 'bg-gradient-to-r from-[#9071FF]/0 via-[#9071FF]/40 to-[#9071FF]/0 opacity-0 group-hover:opacity-100'
                  }`}
                ></div>
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
