import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkspaceService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Find a workspace by ID.
   * The requesterWorkspaceId is the validated workspace from the auth header.
   * Cross-tenant access is blocked here as a second line of defence.
   */
  async findById(workspaceId: string, requesterWorkspaceId: string) {
    if (workspaceId !== requesterWorkspaceId) {
      throw new ForbiddenException('Access denied to this workspace');
    }

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
  }

  async findBySlug(slug: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { slug },
      include: {
        channels: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace "${slug}" not found`);
    }

    return workspace;
  }

  async getMembers(workspaceId: string, requesterWorkspaceId: string) {
    if (workspaceId !== requesterWorkspaceId) {
      throw new ForbiddenException('Access denied to this workspace');
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
}
