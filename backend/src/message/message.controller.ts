import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceGuard } from '../auth/workspace.guard';
import { CurrentUser, AuthUser } from '../auth/auth.decorators';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Controller('workspaces/:workspaceId/channels/:channelId/messages')
@UseGuards(WorkspaceGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Get()
  async getMessages(
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Query('before') before: string | undefined,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messageService.findAll(
      workspaceId,
      channelId,
      user.workspaceId,
      before,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createMessage(
    @Param('workspaceId') workspaceId: string,
    @Param('channelId') channelId: string,
    @Body() dto: CreateMessageDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.messageService.create(
      workspaceId,
      channelId,
      dto,
      user.id,
      user.workspaceId,
    );
  }
}
