import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { ContextManager } from '../context/ContextManager'

/**
 * 上下文初始化攔截器
 * 職責：在每個請求開始時從 DTO 提取 runId，加載 IAppContext 到 ContextManager
 *
 * 工作流程：
 * 1. 從 request.body 提取 runId
 * 2. 驗證 runId 有效性
 * 3. 從 ContextManager 加載該 runId 的 IAppContext
 * 4. 使用 ContextManager 設置當前上下文
 * 5. 請求執行
 */
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

    // 從 ContextManager 加載 IAppContext
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

    // 在當前請求的非同步上下文中設置 IAppContext
    this.contextManager.setContext(appContext)

    // 執行後續的控制器和 Service
    return next.handle()
  }
}
