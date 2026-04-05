'use client';

import { io, Socket } from 'socket.io-client';
import { WS_URL } from './constants';

let socket: Socket | null = null;

/**
 * Returns (and creates if needed) a singleton Socket.io client.
 * Call with userId + workspaceId to authenticate the WebSocket connection.
 * The auth metadata is validated by the ChatGateway on connect.
 */
export function getSocket(userId: string, workspaceId: string): Socket {
  if (socket && socket.connected) {
    return socket;
  }

  // Disconnect stale socket before creating new one (user switch)
  if (socket) {
    socket.disconnect();
    socket = null;
  }

  socket = io(WS_URL, {
    auth: { userId, workspaceId },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
