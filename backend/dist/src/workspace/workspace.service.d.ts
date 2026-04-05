import { PrismaService } from '../prisma/prisma.service';
export declare class WorkspaceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findById(workspaceId: string, requesterWorkspaceId: string): Promise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
    }>;
    findBySlug(slug: string): Promise<{
        channels: {
            id: string;
            name: string;
            createdAt: Date;
            workspaceId: string;
            description: string | null;
        }[];
    } & {
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
    }>;
    getMembers(workspaceId: string, requesterWorkspaceId: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        avatarColor: string;
    }[]>;
}
