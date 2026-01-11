import { BadRequestException, CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common'
import { Request } from 'express'
import { from, Observable } from 'rxjs'
import { switchMap } from 'rxjs/operators'

import { ContextManager } from '../context/context-manager'
import { getRunIdFromRequest } from '../helpers/request-utils'
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
    const runId = getRunIdFromRequest(request)
    if (!runId) {
      throw new BadRequestException(ContextInitializationInterceptor.ERROR_MISSING_RUN_ID)
    }
    return from(this.contextManager.getContextByRunId(runId)).pipe(
      switchMap((appContext) => {
        if (!appContext) {
          throw new BadRequestException(ContextInitializationInterceptor.ERROR_RUN_NOT_FOUND(runId))
        }
        return next.handle()
      })
    )
  }
  private static isPathIgnored(request: Request): boolean {
    return ContextInitializationInterceptor.IGNORED_ENDPOINTS.has(request.path)
  }
  // ...existing code...
}
