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

export const PriceHelper = {
  calculateItemPrice(params: DetailedPricingParameters): number {
    const { config, difficulty, rarity, isBuying, isDiscounted } = params

    const basePrice = config.rarityPriceTable[rarity]

    const discountFactor = isDiscounted ? 1 - config.discountRate : 1

    const priceWithDifficulty = Math.floor(basePrice * (1 + difficulty * config.difficultyMultiplier)) * discountFactor

    return isBuying ? priceWithDifficulty : Math.floor(priceWithDifficulty * 1 - config.salePriceDepreciationRate)
  },

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
