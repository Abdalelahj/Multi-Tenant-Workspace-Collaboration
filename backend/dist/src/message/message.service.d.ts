import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessageService {
    private readonly prisma;
    private readonly redis;
    constructor(prisma: PrismaService, redis: RedisService);
    findAll(workspaceId: string, channelId: string, requesterWorkspaceId: string, before?: string): Promise<({
        author: {
            id: string;
            name: string;
            avatarColor: string;
        };
    } & {
        id: string;
        createdAt: Date;
        workspaceId: string;
        content: string;
        channelId: string;
        authorId: string;
        editedAt: Date | null;
    })[]>;
    create(workspaceId: string, channelId: string, dto: CreateMessageDto, authorId: string, requesterWorkspaceId: string): Promise<{
        author: {
            id: string;
            name: string;
            avatarColor: string;
        };
    } & {
        id: string;
        createdAt: Date;
        workspaceId: string;
        content: string;
        channelId: string;
        authorId: string;
        editedAt: Date | null;
    }>;
}
