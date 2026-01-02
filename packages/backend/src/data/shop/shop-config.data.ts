import { ShopConfig } from '../../domain/shop/ShopConfig'
/**
 * 商店配置資料
 * 定義不同商店的行為參數
 * 注：修飾符策略統一在 ItemRollConfig 管理
 */
export const ShopConfigList: ShopConfig[] = [
  {
    id: 'DEFAULT',
    discountRate: 0.1, // 10% 折扣
    shopSlotCount: 6, // 商店格子數量
    rarityPriceTable: {
      COMMON: 100,
      RARE: 400,
      EPIC: 800,
      LEGENDARY: 1600,
    },
    difficultyMultiplier: 0.1, // 難度係數
    salePriceDepreciationRate: 0.5, // 出售價格折舊率 50%
    baseRefreshCost: 100,
    refreshCostIncrement: 25,
  },
  {
    id: 'PREMIUM',
    discountRate: 0.1, // 10% 折扣
    shopSlotCount: 6, // 商店格子數量
    rarityPriceTable: {
      COMMON: 100,
      RARE: 400,
      EPIC: 800,
      LEGENDARY: 1600,
    },
    difficultyMultiplier: 0.1, // 難度係數
    salePriceDepreciationRate: 0.5, // 出售價格折舊率 50%
    baseRefreshCost: 100,
    refreshCostIncrement: 25,
  },
]
