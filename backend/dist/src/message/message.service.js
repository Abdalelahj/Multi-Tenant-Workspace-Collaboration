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
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const redis_service_1 = require("../redis/redis.service");
const PAGE_SIZE = 50;
let MessageService = class MessageService {
    prisma;
    redis;
    constructor(prisma, redis) {
        this.prisma = prisma;
        this.redis = redis;
    }
    async findAll(workspaceId, channelId, requesterWorkspaceId, before) {
        if (workspaceId !== requesterWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            select: { workspaceId: true },
        });
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Channel not found');
        }
        let cursor;
        if (before) {
            cursor = { id: before };
        }
        const messages = await this.prisma.message.findMany({
            where: { channelId, workspaceId },
            include: {
                author: {
                    select: { id: true, name: true, avatarColor: true },
                },
            },
            orderBy: { createdAt: 'desc' },
            take: PAGE_SIZE,
            ...(cursor ? { skip: 1, cursor } : {}),
        });
        return messages.reverse();
    }
    async create(workspaceId, channelId, dto, authorId, requesterWorkspaceId) {
        if (workspaceId !== requesterWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const allowed = await this.redis.checkRateLimit(workspaceId, authorId);
        if (!allowed) {
            throw new common_1.HttpException('Message rate limit exceeded. Max 10 messages per 10 seconds.', common_1.HttpStatus.TOO_MANY_REQUESTS);
        }
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
            select: { workspaceId: true },
        });
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Channel not found');
        }
        return this.prisma.message.create({
            data: {
                workspaceId,
                channelId,
                authorId,
                content: dto.content,
            },
            include: {
                author: {
                    select: { id: true, name: true, avatarColor: true },
                },
            },
        });
    }
};
exports.MessageService = MessageService;
exports.MessageService = MessageService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        redis_service_1.RedisService])
], MessageService);
//# sourceMappingURL=message.service.js.map