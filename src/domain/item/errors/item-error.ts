/** Item 模組錯誤類型 */
export type ItemErrorCode =
  | 'DUPLICATE_DEFINITION'
  | 'DEFINITION_NOT_FOUND'
  | 'INVALID_AFFIX_POOL'
  | 'INVALID_VALUE_RANGE'
  | 'EFFECT_BUILDER_NOT_FOUND'
/**
 * ItemError
 *
 * Item 模組專屬的錯誤類別。
 * 提供結構化的錯誤資訊，便於調試與跨語言移植。
 */
export class ItemError extends Error {
  readonly code: ItemErrorCode
  readonly context?: Record<string, unknown>
  constructor(code: ItemErrorCode, message: string, context?: Record<string, unknown>) {
    super(message)
    this.name = 'ItemError'
    this.code = code
    this.context = context
  }
  /** 建立重複定義錯誤 */
  static duplicateDefinition(type: string, id: string): ItemError {
    return new ItemError('DUPLICATE_DEFINITION', `${type} with id '${id}' already registered`, {
      type,
      id,
    })
  }
  /** 建立定義未找到錯誤 */
  static definitionNotFound(type: string, id: string): ItemError {
    return new ItemError('DEFINITION_NOT_FOUND', `${type} with id '${id}' not found`, { type, id })
  }
  /** 建立無效詞綴池錯誤 */
  static invalidAffixPool(poolIds: string[]): ItemError {
    return new ItemError('INVALID_AFFIX_POOL', `Invalid affix pool: no valid definitions found`, {
      poolIds,
    })
  }
  /** 建立無效數值範圍錯誤 */
  static invalidValueRange(min: number, max: number): ItemError {
    return new ItemError('INVALID_VALUE_RANGE', `Invalid value range: min(${min}) > max(${max})`, {
      min,
      max,
    })
  }
  /** 建立效果建構器未找到錯誤 */
  static effectBuilderNotFound(templateId: string): ItemError {
    return new ItemError('EFFECT_BUILDER_NOT_FOUND', `Effect builder for template '${templateId}' not found`, {
      templateId,
    })
  }
}
