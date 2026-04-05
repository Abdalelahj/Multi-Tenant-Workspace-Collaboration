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
exports.PresenceService = void 0;
const common_1 = require("@nestjs/common");
const redis_service_1 = require("../redis/redis.service");
const prisma_service_1 = require("../prisma/prisma.service");
let PresenceService = class PresenceService {
    redis;
    prisma;
    constructor(redis, prisma) {
        this.redis = redis;
        this.prisma = prisma;
    }
    async setOnline(workspaceId, userId) {
        await this.redis.setPresence(workspaceId, userId);
    }
    async setOffline(workspaceId, userId) {
        await this.redis.removePresence(workspaceId, userId);
    }
    async heartbeat(workspaceId, userId) {
        await this.redis.setPresence(workspaceId, userId);
    }
    async getWorkspacePresence(workspaceId, requesterWorkspaceId) {
        if (workspaceId !== requesterWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const onlineIds = await this.redis.getPresence(workspaceId);
        if (onlineIds.length === 0)
            return [];
        const users = await this.prisma.user.findMany({
            where: { id: { in: onlineIds }, workspaceId },
            select: { id: true, name: true, avatarColor: true },
        });
        return users;
    }
};
exports.PresenceService = PresenceService;
exports.PresenceService = PresenceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [redis_service_1.RedisService,
        prisma_service_1.PrismaService])
], PresenceService);
//# sourceMappingURL=presence.service.js.map