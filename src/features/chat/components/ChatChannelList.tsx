import { Clock } from 'lucide-react';

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

export function ChatChannelList({
  channels,
  activeChannelId,
  onSelectChannel,
  formatTime,
}: ChatChannelListProps) {
  return (
    <div className='w-1/3 border-r border-gray-200 pr-4'>
      <h4 className='text-sm font-medium text-gray-700 mb-3'>Conversations</h4>
      <div className='space-y-2 max-h-80 overflow-y-auto'>
        {channels.map((channel) => (
          <div
            key={channel.id}
            onClick={() => onSelectChannel(channel)}
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
  );
}
