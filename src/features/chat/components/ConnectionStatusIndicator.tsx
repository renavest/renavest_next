import type { ConnectionStatusIndicatorProps } from '../types';

export function ConnectionStatusIndicator({ connectionStatus }: ConnectionStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'connected':
        return {
          color: 'text-emerald-600',
          bgColor: 'bg-emerald-50',
          borderColor: 'border-emerald-200',
          icon: '●',
          label: 'Connected',
          description: 'Real-time messaging active',
        };
      case 'connecting':
        return {
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '◐',
          label: 'Connecting',
          description: 'Establishing connection...',
        };
      case 'error':
        return {
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '●',
          label: 'Connection Error',
          description: 'Unable to connect',
        };
      default:
        return {
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '○',
          label: 'Disconnected',
          description: 'Not connected',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div
      className={`inline-flex items-center px-3 py-2 rounded-xl border transition-all duration-300 ${config.bgColor} ${config.borderColor}`}
    >
      <div className='flex items-center space-x-2'>
        <span className={`text-sm font-medium ${config.color} animate-pulse`}>{config.icon}</span>
        <div className='flex flex-col'>
          <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
          <span className={`text-xs ${config.color} opacity-75`}>{config.description}</span>
        </div>
      </div>
    </div>
  );
}
