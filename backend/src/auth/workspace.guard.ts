import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * WorkspaceGuard
 *
 * Multi-tenancy enforcer. Every protected request must include:
 *   X-User-Id: <userId>        (from hardcoded seed values)
 *   X-Workspace-Id: <workspaceId>
 *
 * The guard validates:
 *  1. Both headers are present
 *  2. The user exists in the DB
 *  3. The user belongs to the claimed workspace
 *
 * This makes cross-tenant data access architecturally impossible —
 * even if a client sends the wrong X-Workspace-Id, the DB row
 * won't match their user.workspaceId.
 */
@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const userId = request.headers['x-user-id'] as string | undefined;
    const workspaceId = request.headers['x-workspace-id'] as string | undefined;

    if (!userId || !workspaceId) {
      throw new UnauthorizedException(
        'Missing X-User-Id or X-Workspace-Id header',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, workspaceId: true, name: true, email: true, avatarColor: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.workspaceId !== workspaceId) {
      throw new ForbiddenException('User does not belong to this workspace');
    }

    // Attach the fully-validated user to the request
    request.user = user;
    request.workspaceId = workspaceId;

    return true;
  }
}
