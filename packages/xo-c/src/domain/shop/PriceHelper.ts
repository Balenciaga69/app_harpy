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
  calculateItemPrice(parameters: DetailedPricingParameters): number {
    const { config, difficulty, rarity, isBuying, isDiscounted } = parameters
    const basePrice = config.rarityPriceTable[rarity]
    const discountFactor = isDiscounted ? 1 - config.discountRate : 1
    const priceWithDifficulty = Math.floor(basePrice * (1 + difficulty * config.difficultyMultiplier)) * discountFactor
    return isBuying ? priceWithDifficulty : Math.floor(priceWithDifficulty * 1 - config.salePriceDepreciationRate)
  },
  calculateDiscountedPrice(parameters: pricingParameters): number {
    const { config, difficulty, rarity } = parameters
    return this.calculateItemPrice({
      config,
      difficulty,
      rarity,
      isBuying: true,
      isDiscounted: true,
    })
  },
  calculateSalePrice(parameters: pricingParameters): number {
    const { config, difficulty, rarity } = parameters
    return this.calculateItemPrice({
      config,
      difficulty,
      rarity,
      isBuying: false,
      isDiscounted: false,
    })
  },
}
