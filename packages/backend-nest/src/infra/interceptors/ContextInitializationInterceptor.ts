import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { ContextStorage } from '../context/ContextStorage'
import { AppContextRepository } from '../repositories/AppContextRepository'

/**
 * 上下文初始化攔截器
 * 職責：在每個請求開始時從 DTO 提取 runId，加載 IAppContext 到 ContextStorage
 *
 * 工作流程：
 * 1. 從 request.body 提取 runId
 * 2. 驗證 runId 有效性
 * 3. 從 Repository 加載該 runId 的 IAppContext
 * 4. 使用 ContextStorage 設置當前上下文
 * 5. 請求執行
 * 6. 請求完成後可以自動保存變更（可選）
 */
@Injectable()
export class ContextInitializationInterceptor implements NestInterceptor {
  constructor(private contextRepository: AppContextRepository) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const body = request.body as Record<string, any>

    // 提取並驗證 runId
    const runId = body?.runId
    if (!runId || typeof runId !== 'string') {
      throw new BadRequestException({
        error: 'MISSING_RUN_ID',
        message: '請求必須包含有效的 runId',
      })
    }

    // 從 Repository 加載 IAppContext
    // 注意：這裡假設 getByRunId 是同步的，如果是異步需要改為異步處理
    let appContext
    try {
      appContext = this.contextRepository.getByRunId(runId)
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

    // 在當前請求的異步上下文中設置 IAppContext
    ContextStorage.setContext(appContext)

    // 執行後續的控制器和 Service
    return next.handle()
  }
}
