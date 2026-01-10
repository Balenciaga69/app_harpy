import { BadRequestException } from '@nestjs/common'
import { Result } from 'src/from-game-core'
/**
 * Result ???NestJS Exception ??撠
 * - 撠?game-core 撅斤? Result 頧???API ?啣虜
 * - 蝯曹??航炊隞?Ⅳ???摩
 */
export class ResultToExceptionMapper {
  /**
   * ?? Result嚗??仃???撠??撣?
   */
  static throwIfFailure<T>(result: Result<T>, errorMessage: string = '??憭望?'): void {
    if (result.isFailure) {
      this.throwException(result.error || 'UNKNOWN_ERROR', errorMessage)
    }
  }
  /**
   * ?寞??航炊蝣潭??箏????啣虜
   */
  private static throwException(errorCode: string, defaultMessage: string): void {
    const message = this.mapErrorCodeToMessage(errorCode)
    throw new BadRequestException({
      error: errorCode,
      message: message || defaultMessage,
    })
  }
  /**
   * 撠隤斤Ⅳ???唬犖憿霈????
   * ?桀??芣?撠歇?亦??航炊蝣?
   */
  private static mapErrorCodeToMessage(errorCode: string): string {
    const errorMap: Record<string, string> = {
      // Shop ?賊?
      INSUFFICIENT_GOLD: '?馳銝雲',
      STASH_FULL: '?澈撌脫遛',
      ITEM_NOT_SELLABLE: '?拙??⊥?鞎抵都',
    }
    return errorMap[errorCode] || ''
  }
}
