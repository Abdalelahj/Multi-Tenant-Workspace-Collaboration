import { AuthUser } from '../auth/auth.decorators';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class MessageController {
    private readonly messageService;
    constructor(messageService: MessageService);
    getMessages(workspaceId: string, channelId: string, before: string | undefined, user: AuthUser): Promise<({
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
    createMessage(workspaceId: string, channelId: string, dto: CreateMessageDto, user: AuthUser): Promise<{
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
