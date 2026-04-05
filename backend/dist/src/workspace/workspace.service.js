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
exports.WorkspaceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let WorkspaceService = class WorkspaceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findById(workspaceId, requesterWorkspaceId) {
        if (workspaceId !== requesterWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied to this workspace');
        }
        const workspace = await this.prisma.workspace.findUnique({
            where: { id: workspaceId },
        });
        if (!workspace) {
            throw new common_1.NotFoundException('Workspace not found');
        }
        return workspace;
    }
    async findBySlug(slug) {
        const workspace = await this.prisma.workspace.findUnique({
            where: { slug },
            include: {
                channels: {
                    orderBy: { createdAt: 'asc' },
                },
            },
        });
        if (!workspace) {
            throw new common_1.NotFoundException(`Workspace "${slug}" not found`);
        }
        return workspace;
    }
    async getMembers(workspaceId, requesterWorkspaceId) {
        if (workspaceId !== requesterWorkspaceId) {
            throw new common_1.ForbiddenException('Access denied to this workspace');
        }
        return this.prisma.user.findMany({
            where: { workspaceId },
            select: {
                id: true,
                name: true,
                email: true,
                avatarColor: true,
                createdAt: true,
            },
            orderBy: { name: 'asc' },
        });
    }
};
exports.WorkspaceService = WorkspaceService;
exports.WorkspaceService = WorkspaceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkspaceService);
//# sourceMappingURL=workspace.service.js.map