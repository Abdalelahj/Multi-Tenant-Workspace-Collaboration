import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { PresenceService } from '../presence/presence.service';
import { MessageService } from '../message/message.service';

interface AuthenticatedSocket extends Socket {
  userId: string;
  workspaceId: string;
  userName: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly prisma: PrismaService,
    private readonly presenceService: PresenceService,
    private readonly messageService: MessageService,
  ) {}

  // ── Connection Lifecycle ──────────────────────────────────

  async handleConnection(client: AuthenticatedSocket) {
    const userId = client.handshake.auth.userId as string;
    const workspaceId = client.handshake.auth.workspaceId as string;

    if (!userId || !workspaceId) {
      client.emit('error', 'Missing userId or workspaceId in handshake auth');
      client.disconnect();
      return;
    }

    // Validate user belongs to workspace
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, workspaceId: true, name: true },
    });

    if (!user || user.workspaceId !== workspaceId) {
      client.emit('error', 'Unauthorized');
      client.disconnect();
      return;
    }

    // Attach context to socket
    client.userId = user.id;
    client.workspaceId = workspaceId;
    client.userName = user.name;

    // Auto-join workspace room
    await client.join(`workspace:${workspaceId}`);

    // Mark as online in Redis
    await this.presenceService.setOnline(workspaceId, userId);

    // Notify workspace members of new presence
    this.server
      .to(`workspace:${workspaceId}`)
      .emit('presence:update', { userId, name: user.name, online: true });
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (!client.userId || !client.workspaceId) return;

    await this.presenceService.setOffline(client.workspaceId, client.userId);

    this.server
      .to(`workspace:${client.workspaceId}`)
      .emit('presence:update', {
        userId: client.userId,
        name: client.userName,
        online: false,
      });
  }

  // ── Channel Events ────────────────────────────────────────

  @SubscribeMessage('join_channel')
  async handleJoinChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    if (!data?.channelId) throw new WsException('channelId required');

    // Verify channel belongs to user's workspace
    const channel = await this.prisma.channel.findUnique({
      where: { id: data.channelId },
      select: { workspaceId: true, name: true },
    });

    if (!channel || channel.workspaceId !== client.workspaceId) {
      throw new WsException('Channel not found or access denied');
    }

    await client.join(`channel:${data.channelId}`);
    client.emit('joined_channel', { channelId: data.channelId });
  }

  @SubscribeMessage('leave_channel')
  async handleLeaveChannel(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    await client.leave(`channel:${data.channelId}`);
  }

  // ── Messaging ─────────────────────────────────────────────

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string; content: string },
  ) {
    if (!data?.channelId || !data?.content?.trim()) {
      throw new WsException('channelId and content are required');
    }

    let message: Awaited<ReturnType<MessageService['create']>>;

    try {
      message = await this.messageService.create(
        client.workspaceId,
        data.channelId,
        { content: data.content.trim() },
        client.userId,
        client.workspaceId,
      );
    } catch (err: unknown) {
      const httpErr = err as { status?: number; message?: string };
      if (httpErr.status === 429) {
        client.emit('rate_limited', { message: httpErr.message });
        return;
      }
      throw new WsException('Failed to send message');
    }

    // Broadcast to everyone in the channel (including sender for confirmation)
    this.server.to(`channel:${data.channelId}`).emit('new_message', message);

    // Refresh presence heartbeat on activity
    await this.presenceService.heartbeat(client.workspaceId, client.userId);
  }

  // ── Typing Indicator ─────────────────────────────────────

  @SubscribeMessage('typing_start')
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    client.to(`channel:${data.channelId}`).emit('user_typing', {
      userId: client.userId,
      name: client.userName,
      channelId: data.channelId,
    });
  }

  @SubscribeMessage('typing_stop')
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { channelId: string },
  ) {
    client.to(`channel:${data.channelId}`).emit('user_stopped_typing', {
      userId: client.userId,
      channelId: data.channelId,
    });
  }

  // ── Heartbeat ─────────────────────────────────────────────

  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: AuthenticatedSocket) {
    if (client.userId && client.workspaceId) {
      await this.presenceService.heartbeat(client.workspaceId, client.userId);
    }
  }
}
