'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '@/types';
import { apiFetch } from '@/lib/api';
import { Socket } from 'socket.io-client';

interface UseMessagesOptions {
  workspaceId: string;
  channelId: string;
  userId: string;
  socket: Socket | null;
}

export function useMessages({
  workspaceId,
  channelId,
  userId,
  socket,
}: UseMessagesOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // ── Load initial history ───────────────────────────────
  useEffect(() => {
    if (!workspaceId || !userId) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    apiFetch<Message[]>(
      `/workspaces/${workspaceId}/channels/${channelId}/messages`,
      { userId, workspaceId },
    )
      .then((data) => {
        if (!cancelled) setMessages(data);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError((e as Error).message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [workspaceId, channelId, userId]);

  // ── Join channel room & listen for live messages ───────
  useEffect(() => {
    if (!socket) return;

    socket.emit('join_channel', { channelId });

    const handleNewMessage = (msg: Message) => {
      setMessages((prev) => {
        // Deduplicate by id
        if (prev.some((m) => m.id === msg.id)) return prev;

        // Match and replace optimistic message
        if (msg.authorId === userId) {
          const optIndex = prev.findIndex(
            (m) => m.id.startsWith('opt_') && m.content === msg.content
          );

          if (optIndex !== -1) {
            const next = [...prev];
            next[optIndex] = msg;
            return next;
          }
        }

        return [...prev, msg];
      });
      // Scroll to bottom on new message
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    };

    const handleRateLimited = () => {
      setIsRateLimited(true);
      setTimeout(() => setIsRateLimited(false), 10_000);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('rate_limited', handleRateLimited);

    return () => {
      socket.emit('leave_channel', { channelId });
      socket.off('new_message', handleNewMessage);
      socket.off('rate_limited', handleRateLimited);
    };
  }, [socket, channelId]);

  // ── Send message ────────────────────────────────────────
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !content.trim()) return;

      // Optimistic update
      const optimistic: Message = {
        id: `opt_${Date.now()}`,
        workspaceId,
        channelId,
        authorId: userId,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        editedAt: null,
        author: { id: userId, name: 'You', avatarColor: '#6366f1' },
      };

      setMessages((prev) => [...prev, optimistic]);
      socket.emit('send_message', { channelId, content: content.trim() });

      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    },
    [socket, channelId, workspaceId, userId],
  );

  return { messages, loading, error, isRateLimited, sendMessage, bottomRef };
}
