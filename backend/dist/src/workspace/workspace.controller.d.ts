import { AuthUser } from '../auth/auth.decorators';
import { WorkspaceService } from './workspace.service';
export declare class WorkspaceController {
    private readonly workspaceService;
    constructor(workspaceService: WorkspaceService);
    getWorkspaceBySlug(slug: string): Promise<{
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
    getWorkspace(workspaceId: string, user: AuthUser): Promise<{
        id: string;
        slug: string;
        name: string;
        createdAt: Date;
    }>;
    getMembers(workspaceId: string, user: AuthUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        email: string;
        avatarColor: string;
    }[]>;
}
