import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceGuard } from '../auth/workspace.guard';
import { CurrentUser, AuthUser } from '../auth/auth.decorators';
import { ChannelService } from './channel.service';
import { CreateChannelDto } from './dto/create-channel.dto';

@Controller('workspaces/:workspaceId/channels')
@UseGuards(WorkspaceGuard)
export class ChannelController {
  constructor(private readonly channelService: ChannelService) {}

  @Get()
  async getChannels(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.channelService.findAll(workspaceId, user.workspaceId);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createChannel(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateChannelDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.channelService.create(workspaceId, dto, user.workspaceId);
  }
}
