import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelDto } from './dto/create-channel.dto';
export declare class ChannelService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(workspaceId: string, requesterWorkspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        workspaceId: string;
        description: string | null;
    }[]>;
    findOne(channelId: string, workspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        workspaceId: string;
        description: string | null;
    }>;
    create(workspaceId: string, dto: CreateChannelDto, requesterWorkspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        workspaceId: string;
        description: string | null;
    }>;
}
