import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class PresenceService {
    private readonly redis;
    private readonly prisma;
    constructor(redis: RedisService, prisma: PrismaService);
    setOnline(workspaceId: string, userId: string): Promise<void>;
    setOffline(workspaceId: string, userId: string): Promise<void>;
    heartbeat(workspaceId: string, userId: string): Promise<void>;
    getWorkspacePresence(workspaceId: string, requesterWorkspaceId: string): Promise<{
        id: string;
        name: string;
        avatarColor: string;
    }[]>;
}
