import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { PrismaService } from '../prisma/prisma.service';
import { PresenceService } from '../presence/presence.service';
import { MessageService } from '../message/message.service';
interface AuthenticatedSocket extends Socket {
    userId: string;
    workspaceId: string;
    userName: string;
}
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private readonly prisma;
    private readonly presenceService;
    private readonly messageService;
    server: Server;
    constructor(prisma: PrismaService, presenceService: PresenceService, messageService: MessageService);
    handleConnection(client: AuthenticatedSocket): Promise<void>;
    handleDisconnect(client: AuthenticatedSocket): Promise<void>;
    handleJoinChannel(client: AuthenticatedSocket, data: {
        channelId: string;
    }): Promise<void>;
    handleLeaveChannel(client: AuthenticatedSocket, data: {
        channelId: string;
    }): Promise<void>;
    handleSendMessage(client: AuthenticatedSocket, data: {
        channelId: string;
        content: string;
    }): Promise<void>;
    handleTypingStart(client: AuthenticatedSocket, data: {
        channelId: string;
    }): void;
    handleTypingStop(client: AuthenticatedSocket, data: {
        channelId: string;
    }): void;
    handleHeartbeat(client: AuthenticatedSocket): Promise<void>;
}
export {};
