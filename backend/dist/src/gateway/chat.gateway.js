"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const prisma_service_1 = require("../prisma/prisma.service");
const presence_service_1 = require("../presence/presence.service");
const message_service_1 = require("../message/message.service");
let ChatGateway = class ChatGateway {
    prisma;
    presenceService;
    messageService;
    server;
    constructor(prisma, presenceService, messageService) {
        this.prisma = prisma;
        this.presenceService = presenceService;
        this.messageService = messageService;
    }
    async handleConnection(client) {
        const userId = client.handshake.auth.userId;
        const workspaceId = client.handshake.auth.workspaceId;
        if (!userId || !workspaceId) {
            client.emit('error', 'Missing userId or workspaceId in handshake auth');
            client.disconnect();
            return;
        }
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, workspaceId: true, name: true },
        });
        if (!user || user.workspaceId !== workspaceId) {
            client.emit('error', 'Unauthorized');
            client.disconnect();
            return;
        }
        client.userId = user.id;
        client.workspaceId = workspaceId;
        client.userName = user.name;
        await client.join(`workspace:${workspaceId}`);
        await this.presenceService.setOnline(workspaceId, userId);
        this.server
            .to(`workspace:${workspaceId}`)
            .emit('presence:update', { userId, name: user.name, online: true });
    }
    async handleDisconnect(client) {
        if (!client.userId || !client.workspaceId)
            return;
        await this.presenceService.setOffline(client.workspaceId, client.userId);
        this.server
            .to(`workspace:${client.workspaceId}`)
            .emit('presence:update', {
            userId: client.userId,
            name: client.userName,
            online: false,
        });
    }
    async handleJoinChannel(client, data) {
        if (!data?.channelId)
            throw new websockets_1.WsException('channelId required');
        const channel = await this.prisma.channel.findUnique({
            where: { id: data.channelId },
            select: { workspaceId: true, name: true },
        });
        if (!channel || channel.workspaceId !== client.workspaceId) {
            throw new websockets_1.WsException('Channel not found or access denied');
        }
        await client.join(`channel:${data.channelId}`);
        client.emit('joined_channel', { channelId: data.channelId });
    }
    async handleLeaveChannel(client, data) {
        await client.leave(`channel:${data.channelId}`);
    }
    async handleSendMessage(client, data) {
        if (!data?.channelId || !data?.content?.trim()) {
            throw new websockets_1.WsException('channelId and content are required');
        }
        let message;
        try {
            message = await this.messageService.create(client.workspaceId, data.channelId, { content: data.content.trim() }, client.userId, client.workspaceId);
        }
        catch (err) {
            const httpErr = err;
            if (httpErr.status === 429) {
                client.emit('rate_limited', { message: httpErr.message });
                return;
            }
            throw new websockets_1.WsException('Failed to send message');
        }
        this.server.to(`channel:${data.channelId}`).emit('new_message', message);
        await this.presenceService.heartbeat(client.workspaceId, client.userId);
    }
    handleTypingStart(client, data) {
        client.to(`channel:${data.channelId}`).emit('user_typing', {
            userId: client.userId,
            name: client.userName,
            channelId: data.channelId,
        });
    }
    handleTypingStop(client, data) {
        client.to(`channel:${data.channelId}`).emit('user_stopped_typing', {
            userId: client.userId,
            channelId: data.channelId,
        });
    }
    async handleHeartbeat(client) {
        if (client.userId && client.workspaceId) {
            await this.presenceService.heartbeat(client.workspaceId, client.userId);
        }
    }
};
exports.ChatGateway = ChatGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], ChatGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join_channel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleJoinChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave_channel'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleLeaveChannel", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('send_message'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleSendMessage", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_start'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStart", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('typing_stop'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], ChatGateway.prototype, "handleTypingStop", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('heartbeat'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ChatGateway.prototype, "handleHeartbeat", null);
exports.ChatGateway = ChatGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
            credentials: true,
        },
        namespace: '/',
    }),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        presence_service_1.PresenceService,
        message_service_1.MessageService])
], ChatGateway);
//# sourceMappingURL=chat.gateway.js.map