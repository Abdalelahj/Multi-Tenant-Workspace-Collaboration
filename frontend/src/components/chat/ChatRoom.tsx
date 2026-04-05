'use client';

import { useState, useEffect, useRef } from 'react';
import { Hash } from 'lucide-react';
import { SEED_USERS } from '@/lib/constants';
import { getSocket } from '@/lib/socket';
import { useMessages } from '@/hooks/useMessages';
import { MessageList } from './MessageList';
import { MessageInput } from './MessageInput';
import { apiFetch } from '@/lib/api';
import { Channel } from '@/types';
import { Spinner } from '@/components/ui/Spinner';
import { TypingEvent } from '@/types';
import { Socket } from 'socket.io-client';

interface ChatRoomProps {
  channelId: string;
  workspaceSlug: string;
}

/**
 * ChatRoom — fully CSR real-time chat component.
 * Handles: user session, socket connection, messages, typing indicators.
 */
export function ChatRoom({ channelId, workspaceSlug }: ChatRoomProps) {
  const [userId, setUserId] = useState<string | null>(null);
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);
  const [channel, setChannel] = useState<Channel | null>(null);
  const [channelLoading, setChannelLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // Read session from sessionStorage
  useEffect(() => {
    const uid = sessionStorage.getItem('reasonix_user_id');
    setUserId(uid);
  }, []);

  // Get workspaceId from the slug via workspace data already in shell
  // We fetch channel info to get workspaceId too
  useEffect(() => {
    if (!userId) return;
    const user = SEED_USERS.find((u) => u.id === userId);
    if (!user) return;

    // Fetch workspace to get ID
    fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000'}/api/workspaces/slug/${workspaceSlug}`)
      .then((r) => r.json())
      .then((ws: { id: string; channels?: Channel[] }) => {
        setWorkspaceId(ws.id);
        const ch = ws.channels?.find((c) => c.id === channelId);
        if (ch) {
          setChannel(ch);
          setChannelLoading(false);
        } else {
          setChannelLoading(false);
        }
      })
      .catch(() => setChannelLoading(false));
  }, [userId, workspaceSlug, channelId]);

  // Initialize socket
  useEffect(() => {
    if (!userId || !workspaceId) return;
    setSocket(getSocket(userId, workspaceId));
  }, [userId, workspaceId]);

  // Typing indicator subscription
  useEffect(() => {
    if (!socket) return;

    const handleTyping = (data: TypingEvent) => {
      if (data.channelId !== channelId || data.userId === userId) return;
      setTypingUsers((prev) =>
        prev.includes(data.name) ? prev : [...prev, data.name],
      );
    };

    const handleStopTyping = (data: { userId: string; channelId: string }) => {
      if (data.channelId !== channelId) return;
      const name = SEED_USERS.find((u) => u.id === data.userId)?.name;
      if (name) setTypingUsers((prev) => prev.filter((n) => n !== name));
    };

    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);
    return () => {
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, [socket, channelId, userId]);

  const { messages, loading, error, isRateLimited, sendMessage, bottomRef } =
    useMessages({
      workspaceId: workspaceId ?? '',
      channelId,
      userId: userId ?? '',
      socket,
    });

  if (!userId || channelLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Channel Header */}
      <header className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 shrink-0">
        <Hash size={18} className="text-gray-500" />
        <h2 className="font-semibold text-white text-sm">
          {channel?.name ?? channelId}
        </h2>
        {channel?.description && (
          <>
            <span className="text-gray-700">·</span>
            <p className="text-xs text-gray-500 truncate">{channel.description}</p>
          </>
        )}
      </header>

      {error && (
        <div className="mx-4 mt-3 px-3 py-2 bg-red-900/40 border border-red-800 rounded-md text-xs text-red-400">
          {error}
        </div>
      )}

      {/* Messages */}
      <MessageList
        messages={messages}
        loading={loading}
        currentUserId={userId}
        bottomRef={bottomRef as React.RefObject<HTMLDivElement>}
        typingUsers={typingUsers}
      />

      {/* Input */}
      <MessageInput
        channelName={channel?.name ?? 'channel'}
        onSend={sendMessage}
        isRateLimited={isRateLimited}
        socket={socket}
        channelId={channelId}
        disabled={!workspaceId}
      />
    </div>
  );
}
