import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { Request, Response } from 'express'
/**
 * API ?航炊??蝯?
 */
interface ApiErrorResponse {
  success: false
  error: string
  message: string
  details?: unknown
  timestamp: string
  path: string
}
/**
 * ?典??啣虜?蕪??
 * - 蝯曹????撣?
 * - 頧??箸?皞???API ?航炊??
 * - 閮?閰喟敦?隤斗隤?
 */
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
  /**
   * ?? HTTP ??Ⅳ
   */
  private getStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus()
    }
    return HttpStatus.INTERNAL_SERVER_ERROR
  }
  /**
   * 撱箇?璅????航炊??
   */
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
    // ????HttpException ?隤?
    const message = exception instanceof Error ? exception.message : String(exception)
    return {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message,
      timestamp: now,
      path,
    }
  }
  /**
   * 閮??航炊?亥?
   */
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
