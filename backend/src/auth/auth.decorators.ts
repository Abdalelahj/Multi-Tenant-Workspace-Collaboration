import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * AuthUser as a class (not interface) so TypeScript can emit
 * decorator metadata in strict/isolatedModules mode.
 */
export class AuthUser {
  id!: string;
  workspaceId!: string;
  name!: string;
  email!: string;
  avatarColor!: string;
}

/** Extracts the validated user from the request (set by WorkspaceGuard) */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as AuthUser;
  },
);

/** Extracts the validated workspaceId from the request */
export const CurrentWorkspace = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.workspaceId as string;
  },
);
