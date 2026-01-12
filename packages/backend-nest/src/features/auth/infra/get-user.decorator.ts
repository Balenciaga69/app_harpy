import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import type { Request } from 'express'

export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): unknown => {
  const request = ctx.switchToHttp().getRequest<Request>()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return (request as unknown as { user?: unknown }).user
})
