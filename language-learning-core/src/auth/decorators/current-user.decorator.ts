import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * User type from JWT payload.
 */
export interface AuthUser {
  id: string;
  email: string;
  username: string;
  totalXp?: string;
  streakDays?: number;
}

/**
 * Parameter decorator to extract current user from JWT.
 *
 * Usage:
 * @Get('profile')
 * getProfile(@CurrentUser() user: AuthUser) {
 *   return user;
 * }
 *
 * Or get a specific property:
 * @Get('profile')
 * getProfile(@CurrentUser('id') userId: string) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthUser;

    return data ? user?.[data] : user;
  },
);
