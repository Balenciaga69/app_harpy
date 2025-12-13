/**
 * Shop Models
 *
 * 商店模組的核心資料結構定義 - 向後兼容的 re-export
 * @deprecated 請直接從各個獨立檔案 import
 */

export type { IShopItem } from './IShopItem'
export type { IShopConfig } from './IShopConfig'
export type { IPurchaseResult, ISellResult } from './IShopResults'
export type { IRefreshResult } from './IRefreshResult'
export type { ShopEvents } from './ShopEvents'
export type { IInventoryAdapter, IDifficultyAdapter, IItemGenerator } from './adapters/IShopAdapters'
export type { IPricingEngine, EquipmentRarity } from './IPricingEngine'
export type { IShopManager, IShopManagerConfig } from './IShopManager'
