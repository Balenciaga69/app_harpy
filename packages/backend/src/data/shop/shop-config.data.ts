import { ShopConfig } from '../../domain/shop/Shop'

/**
 * 商店配置資料
 * 定義不同商店的行為參數
 */
export const ShopConfigList: ShopConfig[] = [
  {
    id: 'default-shop',
    discountRate: 0.1, // 10% 折扣
    baseRefreshPrice: 50, // 基礎刷新價格
    shopSlotCount: 6, // 商店格子數量
    rarityPriceTable: {
      COMMON: 100,
      RARE: 400,
      EPIC: 800,
      LEGENDARY: 1600,
    },
    difficultyMultiplier: 0.1, // 難度係數
    salePriceDepreciationRate: 0.5, // 出售價格折舊率 50%
  },
  {
    id: 'premium-shop',
    discountRate: 0.2, // 20% 折扣
    baseRefreshPrice: 100, // 更高的刷新價格
    shopSlotCount: 7, // 更多格子
    rarityPriceTable: {
      COMMON: 80,
      RARE: 320,
      EPIC: 640,
      LEGENDARY: 1280,
    },
    difficultyMultiplier: 0.15, // 更高的難度係數
    salePriceDepreciationRate: 0.6, // 出售價格折舊率 60%
  },
]
