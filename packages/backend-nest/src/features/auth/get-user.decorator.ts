import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticatedUser } from './user/model/authenticated-user.ts'
export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): AuthenticatedUser => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const user = ctx.switchToHttp().getRequest().user
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return user
})
