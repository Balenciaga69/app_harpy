import { BadRequestException } from '@nestjs/common'
import { ApplicationErrorCode, DomainErrorCode, getErrorMessage, Result } from 'src/from-xo-c'
type KnownErrorCode = DomainErrorCode | ApplicationErrorCode | string
export class ResultToExceptionMapper {
  static throwIfFailure<T>(result: Result<T>): void {
    if (result.isFailure) {
      const errorCode = result.error || 'UNKNOWN_ERROR'
      const message = this.getErrorMessage(errorCode)
      throw new BadRequestException({
        error: errorCode,
        message: message || '未知的錯誤',
      })
    }
  }
  private static getErrorMessage(errorCode: KnownErrorCode): string {
    if (errorCode in DomainErrorCode || errorCode in ApplicationErrorCode) {
      return getErrorMessage(errorCode as DomainErrorCode | ApplicationErrorCode)
    }
    return ''
  }
}
