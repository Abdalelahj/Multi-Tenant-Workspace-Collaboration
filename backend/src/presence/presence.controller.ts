import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkspaceGuard } from '../auth/workspace.guard';
import { CurrentUser, AuthUser } from '../auth/auth.decorators';
import { PresenceService } from './presence.service';

@Controller('workspaces/:workspaceId/presence')
@UseGuards(WorkspaceGuard)
export class PresenceController {
  constructor(private readonly presenceService: PresenceService) {}

  @Get()
  async getPresence(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.presenceService.getWorkspacePresence(
      workspaceId,
      user.workspaceId,
    );
  }
}
