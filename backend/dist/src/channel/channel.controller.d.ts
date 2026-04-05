import { AuthUser } from '../auth/auth.decorators';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';
export declare class ChannelController {
    private readonly channelService;
    constructor(channelService: ChannelService);
    getChannels(workspaceId: string, user: AuthUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        workspaceId: string;
        description: string | null;
    }[]>;
    createChannel(workspaceId: string, dto: CreateChannelDto, user: AuthUser): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        workspaceId: string;
        description: string | null;
    }>;
}
