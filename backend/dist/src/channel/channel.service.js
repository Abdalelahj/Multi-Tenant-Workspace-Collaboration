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
exports.ChannelService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ChannelService = class ChannelService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(workspaceId, requesterWorkspaceId) {
        if (workspaceId !== requesterWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return this.prisma.channel.findMany({
            where: { workspaceId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async findOne(channelId, workspaceId) {
        const channel = await this.prisma.channel.findUnique({
            where: { id: channelId },
        });
        if (!channel || channel.workspaceId !== workspaceId) {
            throw new common_1.NotFoundException('Channel not found');
        }
        return channel;
    }
    async create(workspaceId, dto, requesterWorkspaceId) {
        if (workspaceId !== requesterWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const slug = dto.name.toLowerCase().replace(/\s+/g, '-');
        try {
            return await this.prisma.channel.create({
                data: {
                    workspaceId,
                    name: slug,
                    description: dto.description,
                },
            });
        }
        catch (e) {
            if (e.code === 'P2002') {
                throw new common_1.ConflictException(`Channel "${slug}" already exists in this workspace`);
            }
            throw e;
        }
    }
};
exports.ChannelService = ChannelService;
exports.ChannelService = ChannelService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChannelService);
//# sourceMappingURL=channel.service.js.map