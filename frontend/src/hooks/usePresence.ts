'use client';

import { useState, useEffect, useCallback } from 'react';
import { PresenceUser, PresenceUpdate } from '@/types';
import { apiFetch } from '@/lib/api';
import { Socket } from 'socket.io-client';

interface UsePresenceOptions {
  workspaceId: string;
  userId: string;
  socket: Socket | null;
}

export function usePresence({ workspaceId, userId, socket }: UsePresenceOptions) {
  const [onlineUsers, setOnlineUsers] = useState<PresenceUser[]>([]);

  const fetchPresence = useCallback(async () => {
    if (!workspaceId || !userId) return;
    try {
      const data = await apiFetch<PresenceUser[]>(
        `/workspaces/${workspaceId}/presence`,
        { userId, workspaceId },
      );
      setOnlineUsers(data);
    } catch {
      // Presence is best-effort — no surface errors to the user
    }
  }, [workspaceId, userId]);

  // Initial load + poll every 30s
  useEffect(() => {
    fetchPresence();
    const interval = setInterval(fetchPresence, 30_000);
    return () => clearInterval(interval);
  }, [fetchPresence]);

  // Live presence updates from socket
  useEffect(() => {
    if (!socket) return;

    const handlePresenceUpdate = (update: PresenceUpdate) => {
      setOnlineUsers((prev) => {
        if (update.online) {
          if (prev.some((u) => u.id === update.userId)) return prev;
          return [...prev, { id: update.userId, name: update.name, avatarColor: '' }];
        } else {
          return prev.filter((u) => u.id !== update.userId);
        }
      });
    };

    socket.on('presence:update', handlePresenceUpdate);
    
    // Send heartbeat to prevent Redis TTL expiry
    const heartbeat = setInterval(() => {
      if (socket.connected) socket.emit('heartbeat');
    }, 25_000);

    return () => { 
      socket.off('presence:update', handlePresenceUpdate); 
      clearInterval(heartbeat);
    };
  }, [socket]);

  const isOnline = useCallback(
    (id: string) => onlineUsers.some((u) => u.id === id),
    [onlineUsers],
  );

  return { onlineUsers, isOnline };
}
