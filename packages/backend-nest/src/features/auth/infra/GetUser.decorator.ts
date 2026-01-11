import { createParamDecorator, ExecutionContext } from '@nestjs/common'
export const GetUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const request = ctx.switchToHttp().getRequest()
  return (request as unknown as { user?: unknown }).user
})
