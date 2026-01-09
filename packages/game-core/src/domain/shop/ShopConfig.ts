import { ItemRarity } from '../item/Item'

export type ShopConfigId = 'DEFAULT' | 'PREMIUM'

export interface ShopConfig {
  readonly id: ShopConfigId

  readonly discountRate: number

  readonly baseRefreshCost: number

  readonly refreshCostIncrement: number

  readonly shopSlotCount: number

  readonly rarityPriceTable: Record<ItemRarity, number>

  readonly difficultyMultiplier: number

  readonly salePriceDepreciationRate: number
}
