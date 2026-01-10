import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common'
import { Observable, from } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Request } from 'express'
import { ContextManager } from '../context/ContextManager'
@Injectable()
export class ContextInitializationInterceptor implements NestInterceptor {
  private static readonly IGNORED_ENDPOINTS = new Set(['/api/run/init'])
  private static readonly ERROR_MISSING_RUN_ID = {
    error: 'MISSING_RUN_ID',
    message: '請求必須包含有效的 runId',
  }
  private static readonly ERROR_RUN_NOT_FOUND = (runId: string) => ({
    error: 'RUN_NOT_FOUND',
    message: `運行 ${runId} 不存在`,
  })
  constructor(private readonly contextManager: ContextManager) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    if (ContextInitializationInterceptor.isPathIgnored(request)) {
      return next.handle()
    }
    const runId = this.getRunIdFromRequest(request)
    if (!runId) {
      throw new BadRequestException(ContextInitializationInterceptor.ERROR_MISSING_RUN_ID)
    }
    return from(this.contextManager.getContextByRunId(runId)).pipe(
      switchMap((appContext) => {
        if (!appContext) {
          throw new BadRequestException(ContextInitializationInterceptor.ERROR_RUN_NOT_FOUND(runId))
        }
        this.contextManager.setContext(appContext)
        return next.handle()
      })
    )
  }
  private static isPathIgnored(request: Request): boolean {
    return ContextInitializationInterceptor.IGNORED_ENDPOINTS.has(request.path)
  }
  private getRunIdFromRequest(request: Request): string | undefined {
    if (request.body && typeof request.body === 'object' && 'runId' in request.body) {
      const val = (request.body as Record<string, unknown>).runId
      return typeof val === 'string' ? val : undefined
    }
    if (request.query && typeof request.query === 'object' && 'runId' in request.query) {
      const val = (request.query as Record<string, unknown>).runId
      return typeof val === 'string' ? val : undefined
    }
    return undefined
  }
}
