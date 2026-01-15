import {
  BadRequestException,
  UnauthorizedException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common'
import { ApplicationErrorCode, DomainErrorCode, getErrorMessage, Result } from 'src/from-xo-c'
import { ApiErrorCode, ApiErrorMessages } from '../errors/ApiErrorCode'
type ErrorCodeUnion = DomainErrorCode | ApplicationErrorCode | ApiErrorCode | string
export class ResultToExceptionMapper {
  static throwIfFailure<T>(result: Result<T>): void {
    if (result.isFailure) {
      const errorCode = result.error || 'UNKNOWN_ERROR'
      this.mapAndThrow(errorCode)
    }
  }
  private static mapAndThrow(errorCode: ErrorCodeUnion): never {
    const message = this.getErrorMessage(errorCode)
    const statusCode = this.getStatusCode(errorCode)
    switch (statusCode) {
      case 401:
        throw new UnauthorizedException({ error: errorCode, message })
      case 403:
        throw new ForbiddenException({ error: errorCode, message })
      case 404:
        throw new NotFoundException({ error: errorCode, message })
      case 500:
        throw new InternalServerErrorException({ error: errorCode, message })
      default:
        throw new BadRequestException({ error: errorCode, message })
    }
  }
  private static getErrorMessage(errorCode: ErrorCodeUnion): string {
    // 優先查詢 API 層錯誤
    if (Object.values(ApiErrorCode).includes(errorCode as ApiErrorCode)) {
      return ApiErrorMessages[errorCode as ApiErrorCode]
    }
    // 其次查詢遊戲層錯誤
    if (
      Object.values(DomainErrorCode).includes(errorCode as DomainErrorCode) ||
      Object.values(ApplicationErrorCode).includes(errorCode as ApplicationErrorCode)
    ) {
      return getErrorMessage(errorCode as DomainErrorCode | ApplicationErrorCode)
    }
    return '未知的錯誤'
  }
  private static getStatusCode(errorCode: ErrorCodeUnion): number {
    // 根據錯誤型別決定 HTTP 狀態碼
    if (
      errorCode === ApiErrorCode.認證_未提供認證 ||
      errorCode === ApiErrorCode.認證_認證無效 ||
      errorCode === ApiErrorCode.認證_令牌過期
    ) {
      return 401
    }
    if (errorCode === ApiErrorCode.授權_權限不足) {
      return 403
    }
    if (errorCode === ApiErrorCode.參數_不存在) {
      return 404
    }
    if (errorCode === ApiErrorCode.伺服器_內部錯誤) {
      return 500
    }
    return 400
  }
}
