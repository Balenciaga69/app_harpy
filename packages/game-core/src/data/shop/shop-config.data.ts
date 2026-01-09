import { ShopConfig } from '../../domain/shop/ShopConfig'
export const ShopConfigList: ShopConfig[] = [
  {
    id: 'DEFAULT',
    discountRate: 0.1,
    shopSlotCount: 6,
    rarityPriceTable: {
      COMMON: 100,
      RARE: 400,
      EPIC: 800,
      LEGENDARY: 1600,
    },
    difficultyMultiplier: 0.1,
    salePriceDepreciationRate: 0.5,
    baseRefreshCost: 100,
    refreshCostIncrement: 25,
  },
  {
    id: 'PREMIUM',
    discountRate: 0.1,
    shopSlotCount: 6,
    rarityPriceTable: {
      COMMON: 100,
      RARE: 400,
      EPIC: 800,
      LEGENDARY: 1600,
    },
    difficultyMultiplier: 0.1,
    salePriceDepreciationRate: 0.5,
    baseRefreshCost: 100,
    refreshCostIncrement: 25,
  },
]
