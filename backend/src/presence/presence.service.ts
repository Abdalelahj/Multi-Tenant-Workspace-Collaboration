import { Injectable, ForbiddenException } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PresenceService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService,
  ) {}

  async setOnline(workspaceId: string, userId: string) {
    await this.redis.setPresence(workspaceId, userId);
  }

  async setOffline(workspaceId: string, userId: string) {
    await this.redis.removePresence(workspaceId, userId);
  }

  async heartbeat(workspaceId: string, userId: string) {
    // Refresh TTL without changing the set membership
    await this.redis.setPresence(workspaceId, userId);
  }

  /**
   * Returns array of { userId, name, avatarColor } for online users.
   * Enriches Redis IDs with Prisma user info.
   */
  async getWorkspacePresence(workspaceId: string, requesterWorkspaceId: string) {
    if (workspaceId !== requesterWorkspaceId) {
      throw new ForbiddenException('Access denied');
    }

    const onlineIds = await this.redis.getPresence(workspaceId);

    if (onlineIds.length === 0) return [];

    const users = await this.prisma.user.findMany({
      where: { id: { in: onlineIds }, workspaceId },
      select: { id: true, name: true, avatarColor: true },
    });

    return users;
  }
}
