import { Injectable, NestInterceptor, ExecutionContext, CallHandler, BadRequestException } from '@nestjs/common'
import { Observable, from } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { Request } from 'express'
import { ContextManager } from '../context/ContextManager'

@Injectable()
export class ContextInitializationInterceptor implements NestInterceptor {
  private readonly ignoredEndpoints = new Set(['/api/run/init'])

  constructor(private contextManager: ContextManager) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const body = (request.body ?? {}) as Record<string, unknown>

    if (this.isPathIgnored(request)) {
      return next.handle()
    }

    this.validateRunId(body)
    const runId = body.runId as string

    return from(this.contextManager.getContextByRunId(runId)).pipe(
      switchMap((appContext) => {
        if (!appContext) {
          this.handleRunNotFound(runId)
        }

        this.contextManager.setContext(appContext)
        return next.handle()
      })
    )
  }

  private isPathIgnored(request: Request): boolean {
    return this.ignoredEndpoints.has(request.path)
  }

  private validateRunId(body: Record<string, unknown>): void {
    if (!body?.runId || typeof body.runId !== 'string') {
      throw new BadRequestException({
        error: 'MISSING_RUN_ID',
        message: '請求必須包含有效的 runId',
      })
    }
  }

  private handleRunNotFound(runId: string): never {
    throw new BadRequestException({
      error: 'RUN_NOT_FOUND',
      message: `運行 ${runId} 不存在`,
    })
  }
}
