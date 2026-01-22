/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common'
import { Response } from 'express'
@Catch(HttpException)
export class ResultExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse<Response>()
    const status = exception.getStatus()
    const exceptionResponse = exception.getResponse()
    response.status(status).json({
      success: false,
      error: (exceptionResponse as any).error || 'UNKNOWN_ERROR',
      message: (exceptionResponse as any).message || exception.message,
      statusCode: status,
    })
  }
}
