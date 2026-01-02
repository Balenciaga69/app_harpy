import { ItemRarity } from '../item/Item'
/** 商店配置ID 類型 */
export type ShopConfigId = 'DEFAULT' | 'PREMIUM'
/** 商店配置介面 */
export interface ShopConfig {
  readonly id: ShopConfigId // 商店配置ID
  readonly discountRate: number // 折扣率
  readonly baseRefreshCost: number // 基礎刷新費用
  readonly refreshCostIncrement: number // 每次刷新增加費用
  readonly shopSlotCount: number // 商店格子數量
  readonly rarityPriceTable: Record<ItemRarity, number> // 稀有度價格表
  readonly difficultyMultiplier: number // 難度係數
  readonly salePriceDepreciationRate: number // 出售價格折舊率
}
