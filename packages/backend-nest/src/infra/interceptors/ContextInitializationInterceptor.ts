import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common'
import { Observable } from 'rxjs'
import { Request } from 'express'
import { ContextManager } from '../context/ContextManager'
@Injectable()
export class ContextInitializationInterceptor implements NestInterceptor {
  // 可允許不帶 runId 的端點群
  private readonly ignoredEndpoints = new Set(['/api/run/init'])
  constructor(private contextManager: ContextManager) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>()
    const body = request.body as Record<string, any>
    if (this.isPathIgnored(request)) {
      return next.handle()
    }
    this.validateRunId(body)
    const runId = body.runId as string
    let appContext
    try {
      appContext = this.contextManager.getContextByRunId(runId)
    } catch (error) {
      this.handleInvalidRunId(runId, error)
    }
    if (!appContext) {
      this.handleRunNotFound(runId)
    }
    this.contextManager.setContext(appContext)
    return next.handle()
  }
  private isPathIgnored(request: Request): boolean {
    return this.ignoredEndpoints.has(request.path)
  }
  private validateRunId(body: Record<string, any>): void {
    if (!body?.runId || typeof body.runId !== 'string') {
      throw new BadRequestException({
        error: 'MISSING_RUN_ID',
        message: '請求必須包含有效的 runId',
      })
    }
  }
  private handleInvalidRunId(runId: string, error: unknown): never {
    throw new BadRequestException({
      error: 'INVALID_RUN_ID',
      message: `無法加載運行 ${runId} 的上下文`,
      details: error instanceof Error ? error.message : undefined,
    })
  }
  private handleRunNotFound(runId: string): never {
    throw new BadRequestException({
      error: 'RUN_NOT_FOUND',
      message: `運行 ${runId} 不存在`,
    })
  }
}
