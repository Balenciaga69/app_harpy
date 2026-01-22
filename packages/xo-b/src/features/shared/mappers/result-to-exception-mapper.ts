import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ApplicationErrorCode, DomainErrorCode, getErrorMessage, Result } from 'src/from-xo-c'

import { ApiErrorCode, ApiErrorMessages } from '../errors/ApiErrorCode'
type ErrorCodeUnion = DomainErrorCode | ApplicationErrorCode | ApiErrorCode | string
export class ResultToExceptionMapper {
  /** 如果 Result Failure, 則 Throw Exception */
  static throwIfFailure<T>(result: Result<T>): void {
    if (result.isFailure) {
      const errorCode = result.error || 'UNKNOWN_ERROR'
      this.mapAndThrow(errorCode)
    }
  }
  /** 映射錯誤代碼並拋出對應的異常 */
  private static mapAndThrow(errorCode: ErrorCodeUnion): never {
    const message = this.getErrorMessage(errorCode)
    const statusCode = this.getStatusCode(errorCode)
    switch (statusCode) {
      case 401: {
        throw new UnauthorizedException({ error: errorCode, message })
      }
      case 403: {
        throw new ForbiddenException({ error: errorCode, message })
      }
      case 404: {
        throw new NotFoundException({ error: errorCode, message })
      }
      case 500: {
        throw new InternalServerErrorException({ error: errorCode, message })
      }
      default: {
        throw new BadRequestException({ error: errorCode, message })
      }
    }
  }
  /** 根據錯誤代碼取得錯誤訊息 */
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
  /** 根據 ErrorCode 取得 StatusCode */
  private static getStatusCode(errorCode: ErrorCodeUnion): number {
    const apiErrorCode = errorCode as ApiErrorCode
    if (
      apiErrorCode === ApiErrorCode.認證_未提供認證 ||
      apiErrorCode === ApiErrorCode.認證_認證無效 ||
      apiErrorCode === ApiErrorCode.認證_令牌過期
    ) {
      return 401
    }
    if (apiErrorCode === ApiErrorCode.授權_權限不足) {
      return 403
    }
    if (apiErrorCode === ApiErrorCode.參數_不存在) {
      return 404
    }
    if (apiErrorCode === ApiErrorCode.伺服器_內部錯誤) {
      return 500
    }
    return 400
  }
}
