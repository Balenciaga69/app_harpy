/**
 * Shop Module
 *
 * 商店模組，負責交易與商品管理。
 * 提供購買/出售功能，並整合 ItemGenerator 生成商品實例。
 */
// === Models ===
export type { IShopItem, IShopConfig, IPurchaseResult, ISellResult, IRefreshResult } from './models'
// === Errors ===
export type { ShopErrorCode } from './errors'
export {
  ShopError,
  InsufficientFundsError,
  InventoryFullError,
  ItemNotFoundError,
  InvalidItemError,
  PricingError,
} from './errors'
// === Pricing ===
export { PricingEngine } from './pricing'
export type { IPricingEngineConfig } from './pricing'
// === Manager ===
export { ShopManager } from './ShopManager'
export type { ShopEvents, IInventoryAdapter, IDifficultyAdapter, IShopManagerConfig } from './ShopManager'
