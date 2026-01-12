import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'
/** 從 `getRequest` 取得 `user` */
export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): unknown => {
  const request = ctx.switchToHttp().getRequest<Request>()
  return (request as unknown as { user?: unknown }).user
})
