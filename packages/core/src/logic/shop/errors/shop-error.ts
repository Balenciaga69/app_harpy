/**
 * ShopError
 *
 * 商店模組的基礎錯誤類別。
 * 所有商店相關的錯誤都繼承自此類別。
 */
export type ShopErrorCode =
  | 'INSUFFICIENT_FUNDS'
  | 'INVENTORY_FULL'
  | 'ITEM_NOT_FOUND'
  | 'INVALID_ITEM'
  | 'PRICING_ERROR'
  | 'GENERATION_ERROR'
/**
 * 商店錯誤基礎類別
 */
export class ShopError extends Error {
  readonly code: ShopErrorCode
  constructor(code: ShopErrorCode, message: string) {
    super(message)
    this.code = code
    this.name = 'ShopError'
  }
}
/**
 * 金幣不足錯誤
 */
export class InsufficientFundsError extends ShopError {
  constructor(required: number, available: number) {
    super('INSUFFICIENT_FUNDS', `金幣不足。需要 ${required}，目前擁有 ${available}`)
    this.name = 'InsufficientFundsError'
  }
}
/**
 * 庫存滿載錯誤
 */
export class InventoryFullError extends ShopError {
  constructor() {
    super('INVENTORY_FULL', '庫存已滿，無法購買更多物品')
    this.name = 'InventoryFullError'
  }
}
/**
 * 物品未找到錯誤
 */
export class ItemNotFoundError extends ShopError {
  constructor(itemId: string) {
    super('ITEM_NOT_FOUND', `找不到物品：${itemId}`)
    this.name = 'ItemNotFoundError'
  }
}
/**
 * 無效物品錯誤
 */
export class InvalidItemError extends ShopError {
  constructor(reason: string) {
    super('INVALID_ITEM', `無效物品：${reason}`)
    this.name = 'InvalidItemError'
  }
}
/**
 * 定價錯誤
 */
export class PricingError extends ShopError {
  constructor(reason: string) {
    super('PRICING_ERROR', `定價計算失敗：${reason}`)
    this.name = 'PricingError'
  }
}
