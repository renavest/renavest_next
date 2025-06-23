/**
 * Chat Feature State Management
 *
 * This file provides centralized state management for the chat feature using Preact signals.
 * Currently prepared for future expansion when global state management becomes necessary.
 */

import { signal } from '@preact/signals-core';
import type { Message, Channel } from '../types';

// Global chat state (currently unused, prepared for future expansion)
export const chatState = {
  // Active channel management
  activeChannelSignal: signal<Channel | null>(null),

  // Message cache for performance optimization
  messagesCacheSignal: signal<Map<number, Message[]>>(new Map()),

  // Global connection status tracking
  globalConnectionStatusSignal: signal<'disconnected' | 'connecting' | 'connected' | 'error'>(
    'disconnected',
  ),

  // Typing indicators for future enhancement
  typingIndicatorsSignal: signal<Map<number, string[]>>(new Map()),

  // Unread message counts for future notification system
  unreadCountsSignal: signal<Map<number, number>>(new Map()),

  // Channel list cache
  channelsSignal: signal<Channel[]>([]),
};

// State management actions (prepared for future use)
export const chatActions = {
  setActiveChannel: (channel: Channel | null) => {
    chatState.activeChannelSignal.value = channel;
  },

  addMessageToCache: (channelId: number, message: Message) => {
    const currentCache = chatState.messagesCacheSignal.value;
    const channelMessages = currentCache.get(channelId) || [];

    // Avoid duplicates
    if (!channelMessages.find((m) => m.id === message.id)) {
      const updatedMessages = [...channelMessages, message].sort((a, b) => a.ts - b.ts);
      currentCache.set(channelId, updatedMessages);
      chatState.messagesCacheSignal.value = new Map(currentCache);
    }
  },

  clearMessageCache: (channelId?: number) => {
    if (channelId) {
      const currentCache = chatState.messagesCacheSignal.value;
      currentCache.delete(channelId);
      chatState.messagesCacheSignal.value = new Map(currentCache);
    } else {
      chatState.messagesCacheSignal.value = new Map();
    }
  },

  updateGlobalConnectionStatus: (status: 'disconnected' | 'connecting' | 'connected' | 'error') => {
    chatState.globalConnectionStatusSignal.value = status;
  },

  // Future: Typing indicators
  setTypingIndicator: (channelId: number, userEmail: string, isTyping: boolean) => {
    const currentIndicators = chatState.typingIndicatorsSignal.value;
    const channelTyping = currentIndicators.get(channelId) || [];

    if (isTyping && !channelTyping.includes(userEmail)) {
      channelTyping.push(userEmail);
    } else if (!isTyping) {
      const index = channelTyping.indexOf(userEmail);
      if (index > -1) {
        channelTyping.splice(index, 1);
      }
    }

    currentIndicators.set(channelId, channelTyping);
    chatState.typingIndicatorsSignal.value = new Map(currentIndicators);
  },

  // Future: Unread counts
  incrementUnreadCount: (channelId: number) => {
    const currentCounts = chatState.unreadCountsSignal.value;
    const currentCount = currentCounts.get(channelId) || 0;
    currentCounts.set(channelId, currentCount + 1);
    chatState.unreadCountsSignal.value = new Map(currentCounts);
  },

  clearUnreadCount: (channelId: number) => {
    const currentCounts = chatState.unreadCountsSignal.value;
    currentCounts.set(channelId, 0);
    chatState.unreadCountsSignal.value = new Map(currentCounts);
  },

  updateChannelsList: (channels: Channel[]) => {
    chatState.channelsSignal.value = channels;
  },
};

// State selectors for computed values
export const chatSelectors = {
  getActiveChannel: () => chatState.activeChannelSignal.value,
  getMessagesForChannel: (channelId: number) =>
    chatState.messagesCacheSignal.value.get(channelId) || [],
  getGlobalConnectionStatus: () => chatState.globalConnectionStatusSignal.value,
  getTypingUsersForChannel: (channelId: number) =>
    chatState.typingIndicatorsSignal.value.get(channelId) || [],
  getUnreadCountForChannel: (channelId: number) =>
    chatState.unreadCountsSignal.value.get(channelId) || 0,
  getTotalUnreadCount: () => {
    let total = 0;
    chatState.unreadCountsSignal.value.forEach((count) => (total += count));
    return total;
  },
  getChannels: () => chatState.channelsSignal.value,
};

/**
 * Note for future developers:
 *
 * This state management system is prepared but not currently used.
 * The chat feature currently uses local React state via hooks for simplicity.
 *
 * Consider migrating to this global state when:
 * - Multiple components need to share chat state
 * - Implementing features like unread counts across the app
 * - Adding typing indicators or presence detection
 * - Optimizing performance with message caching
 * - Adding cross-tab synchronization
 *
 * Migration would involve:
 * 1. Update useChat hook to use these signals instead of local state
 * 2. Update components to consume state via selectors
 * 3. Implement state persistence if needed
 * 4. Add state synchronization with server
 */
