import { ItemRarity } from '../item/Item'
import { ShopConfig } from './ShopConfig'

export interface PriceCalculationParams {
  readonly config: ShopConfig
  readonly difficulty: number
  readonly rarity: ItemRarity
  readonly isBuying: boolean
  readonly isDiscounted: boolean
}
/** 商店相關輔助函數 */
export const ShopHelper = {
  /** 計算物品價格 */
  calculateItemPrice(params: PriceCalculationParams): number {
    const { config, difficulty, rarity, isBuying, isDiscounted } = params
    // 基礎價格
    const basePrice = config.rarityPriceTable[rarity]
    // 根據難度與折扣計算最終價格
    const discountFactor = isDiscounted ? 1 - config.discountRate : 1
    // 透過難度與折扣計算最終價格
    const priceWithDifficulty = Math.floor(basePrice * (1 + difficulty * config.difficultyMultiplier)) * discountFactor
    // 購買價格或出售價格
    return isBuying ? priceWithDifficulty : Math.floor(priceWithDifficulty * 1 - config.salePriceDepreciationRate)
  },
}
