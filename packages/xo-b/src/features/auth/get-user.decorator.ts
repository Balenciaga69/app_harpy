/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { createParamDecorator, ExecutionContext } from '@nestjs/common'

import { AuthenticatedUser } from './user/model/authenticated-user.js'
export const GetUser = createParamDecorator((_data: unknown, context: ExecutionContext): AuthenticatedUser => {
  const user = context.switchToHttp().getRequest().user
  return user
})
