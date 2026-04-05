import { AuthUser } from '../auth/auth.decorators';
import { PresenceService } from './presence.service';
export declare class PresenceController {
    private readonly presenceService;
    constructor(presenceService: PresenceService);
    getPresence(workspaceId: string, user: AuthUser): Promise<{
        id: string;
        name: string;
        avatarColor: string;
    }[]>;
}
