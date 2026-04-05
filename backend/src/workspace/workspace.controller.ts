import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { WorkspaceGuard } from '../auth/workspace.guard';
import { CurrentUser } from '../auth/auth.decorators';
import { AuthUser } from '../auth/auth.decorators';
import { WorkspaceService } from './workspace.service';

@Controller('workspaces')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Get('slug/:slug')
  async getWorkspaceBySlug(@Param('slug') slug: string) {
    // Public endpoint — used by Next.js SSR to resolve workspace slug to ID
    return this.workspaceService.findBySlug(slug);
  }

  @Get(':workspaceId')
  @UseGuards(WorkspaceGuard)
  async getWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspaceService.findById(workspaceId, user.workspaceId);
  }

  @Get(':workspaceId/members')
  @UseGuards(WorkspaceGuard)
  async getMembers(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: AuthUser,
  ) {
    return this.workspaceService.getMembers(workspaceId, user.workspaceId);
  }
}
