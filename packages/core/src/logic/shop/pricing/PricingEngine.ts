/**
 * PricingEngine
 *
 * 商店定價計算引擎。
 * 根據物品稀有度、難度係數與章節層數計算買賣價格。
 */
import type { EquipmentRarity } from '@/domain/item'
import type { IShopConfig } from '../models'
import { PricingError } from '../errors'
/**
 * 稀有度基礎價格對照表
 */
const RARITY_BASE_PRICE: Record<EquipmentRarity, number> = {
  common: 50,
  magic: 150,
  rare: 400,
  legendary: 1000,
}
/**
 * 定價引擎配置
 */
export interface IPricingEngineConfig {
  /** 基礎價格倍率 */
  basePriceMultiplier?: number
  /** 難度價格倍率（每點難度增加的百分比，例如 0.05 表示每點難度 +5%） */
  difficultyPriceMultiplier?: number
  /** 章節通膨倍率（每章增加的百分比，例如 0.1 表示每章 +10%） */
  chapterInflationMultiplier?: number
  /** 出售折扣率（0-1 之間，例如 0.5 表示賣出價為買入價的 50%） */
  sellDiscountRate?: number
}
/**
 * 定價引擎
 */
export class PricingEngine {
  private readonly basePriceMultiplier: number
  private readonly difficultyPriceMultiplier: number
  private readonly chapterInflationMultiplier: number
  private readonly sellDiscountRate: number
  constructor(config: IPricingEngineConfig = {}) {
    this.basePriceMultiplier = config.basePriceMultiplier ?? 1.0
    this.difficultyPriceMultiplier = config.difficultyPriceMultiplier ?? 0.05
    this.chapterInflationMultiplier = config.chapterInflationMultiplier ?? 0.1
    this.sellDiscountRate = config.sellDiscountRate ?? 0.5
    this.validateConfig()
  }
  /** 計算購買價格 */
  calculateBuyPrice(rarity: EquipmentRarity, difficulty: number, chapter: number): number {
    const basePrice = RARITY_BASE_PRICE[rarity]
    if (!basePrice) {
      throw new PricingError(`未知的稀有度：${rarity}`)
    }
    // 買入價格 = 基礎值 × 基礎倍率 × (1 + 難度倍率 × 難度) × (1 + 通膨倍率 × 章節)
    const difficultyMultiplier = 1 + this.difficultyPriceMultiplier * difficulty
    const inflationMultiplier = 1 + this.chapterInflationMultiplier * chapter
    const finalPrice = basePrice * this.basePriceMultiplier * difficultyMultiplier * inflationMultiplier
    return Math.round(finalPrice)
  }
  /** 計算出售價格 */
  calculateSellPrice(rarity: EquipmentRarity, difficulty: number, chapter: number): number {
    const buyPrice = this.calculateBuyPrice(rarity, difficulty, chapter)
    // 賣出價格 = 買入價格 × 折扣率
    return Math.round(buyPrice * this.sellDiscountRate)
  }
  /** 從 IShopConfig 創建 PricingEngine */
  static fromShopConfig(config: IShopConfig): PricingEngine {
    return new PricingEngine({
      basePriceMultiplier: config.basePriceMultiplier,
      difficultyPriceMultiplier: config.difficultyPriceMultiplier,
      chapterInflationMultiplier: config.chapterInflationMultiplier,
      sellDiscountRate: config.sellDiscountRate,
    })
  }
  /** 驗證配置參數 */
  private validateConfig(): void {
    if (this.basePriceMultiplier <= 0) {
      throw new PricingError('基礎價格倍率必須大於 0')
    }
    if (this.difficultyPriceMultiplier < 0) {
      throw new PricingError('難度價格倍率不可為負數')
    }
    if (this.chapterInflationMultiplier < 0) {
      throw new PricingError('章節通膨倍率不可為負數')
    }
    if (this.sellDiscountRate < 0 || this.sellDiscountRate > 1) {
      throw new PricingError('出售折扣率必須在 0-1 之間')
    }
  }
}
