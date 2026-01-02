import { ItemRarity } from '../item/Item'
import { ShopConfig } from './ShopConfig'
export interface DetailedPricingParameters {
  readonly config: ShopConfig
  readonly difficulty: number
  readonly rarity: ItemRarity
  readonly isBuying: boolean
  readonly isDiscounted: boolean
}
export type pricingParameters = Pick<DetailedPricingParameters, 'config' | 'difficulty' | 'rarity'>
/** 商店相關輔助函數 */
export const PriceHelper = {
  /** 計算物品價格 */
  calculateItemPrice(params: DetailedPricingParameters): number {
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
  /** 計算買入折購品價格 */
  calculateDiscountedPrice(params: pricingParameters): number {
    const { config, difficulty, rarity } = params
    return this.calculateItemPrice({
      config,
      difficulty,
      rarity,
      isBuying: true,
      isDiscounted: true,
    })
  },
  /** 計算賣出價格 */
  calculateSalePrice(params: pricingParameters): number {
    const { config, difficulty, rarity } = params
    return this.calculateItemPrice({
      config,
      difficulty,
      rarity,
      isBuying: false,
      isDiscounted: false,
    })
  },
}
