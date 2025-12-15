/**
 * 商店配置
 */
export interface IShopConfig {
  /** 每次刷新生成的最少商品數量 */
  minItemsPerRefresh: number
  /** 每次刷新生成的最多商品數量 */
  maxItemsPerRefresh: number
  /** 出售折扣率（0-1 之間） */
  sellDiscountRate: number
  /** 基礎價格倍率 */
  basePriceMultiplier: number
  /** 難度價格倍率（每點難度增加的百分比） */
  difficultyPriceMultiplier: number
  /** 章節通膨倍率（每章增加的百分比） */
  chapterInflationMultiplier: number
}
