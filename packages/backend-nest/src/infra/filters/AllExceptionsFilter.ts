import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
interface ApiErrorResponse {
  success: false
  error: string
  message: string
  details?: unknown
  timestamp: string
  path: string
}
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger('AllExceptionsFilter')
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const status = this.getStatus(exception)
    const errorResponse = this.buildErrorResponse(exception, request)
    this.logError(exception, request, status)
    response.status(status).json(errorResponse)
  }
  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus()
    }
    return HttpStatus.INTERNAL_SERVER_ERROR
  }
  private buildErrorResponse(exception: unknown, request: Request): ApiErrorResponse {
    const now = new Date().toISOString()
    const path = request.url
    if (exception instanceof HttpException) {
      const exceptionResponse = exception.getResponse()
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as Record<string, unknown>
        return {
          success: false,
          error: (response.error as string) || 'HTTP_ERROR',
          message: (response.message as string) || exception.message,
          details: response.details,
          timestamp: now,
          path,
        }
      }
      return {
        success: false,
        error: 'HTTP_ERROR',
        message: exception.message,
        timestamp: now,
        path,
      }
    }
    const message = exception instanceof Error ? exception.message : String(exception)
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message,
      timestamp: now,
      path,
    }
  }
  private logError(exception: unknown, request: Request, status: number): void {
    const method = request.method
    const path = request.url
    const ip = request.ip
    if (status >= 500) {
      this.logger.error(
        `Server Error: ${method} ${path} | IP: ${ip}`,
        exception instanceof Error ? exception.stack : String(exception)
      )
    } else if (status >= 400) {
      this.logger.warn(`Client Error: ${method} ${path} | IP: ${ip} | Status: ${status}`)
    }
  }
}
