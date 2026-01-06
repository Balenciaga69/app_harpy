import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { ContextManager } from '../context/ContextManager'
@Injectable()
export class ContextInitializationInterceptor implements NestInterceptor {
  constructor(private contextManager: ContextManager) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const body = request.body as Record<string, any>
    if (request.url === '/api/run/init') {
      // 初始化端點不需要 runId
      return next.handle()
    }
    // 提取並驗證 runId
    const runId = body?.runId
    if (!runId || typeof runId !== 'string') {
      throw new BadRequestException({
        error: 'MISSING_RUN_ID',
        message: '請求必須包含有效的 runId',
      })
    }
    let appContext
    try {
      appContext = this.contextManager.getContextByRunId(runId)
    } catch (error) {
      throw new BadRequestException({
        error: 'INVALID_RUN_ID',
        message: `無法加載運行 ${runId} 的上下文`,
        details: error instanceof Error ? error.message : undefined,
      })
    }
    if (!appContext) {
      throw new BadRequestException({
        error: 'RUN_NOT_FOUND',
        message: `運行 ${runId} 不存在`,
      })
    }
    this.contextManager.setContext(appContext)
    return next.handle()
  }
}
