/**
 * Shop Models
 *
 * 商店模組的核心資料結構定義。
 * 跨語言友好，可序列化為 JSON。
 */
import type { IEquipmentInstance, IRelicInstance } from '@/domain/item'
/**
 * 商店商品
 */
export interface IShopItem {
  /** 商品唯一識別碼 */
  id: string
  /** 物品實例（裝備或遺物） */
  item: IEquipmentInstance | IRelicInstance
  /** 購買價格 */
  price: number
  /** 商品類型 */
  type: 'equipment' | 'relic'
}
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
/**
 * 購買結果
 */
export interface IPurchaseResult {
  /** 是否成功 */
  success: boolean
  /** 購買的商品 */
  item?: IEquipmentInstance | IRelicInstance
  /** 花費的金幣 */
  goldSpent: number
  /** 錯誤訊息（如果失敗） */
  error?: string
}
/**
 * 出售結果
 */
export interface ISellResult {
  /** 是否成功 */
  success: boolean
  /** 獲得的金幣 */
  goldEarned: number
  /** 錯誤訊息（如果失敗） */
  error?: string
}
/**
 * 刷新結果
 */
export interface IRefreshResult {
  /** 新生成的商品清單 */
  items: IShopItem[]
  /** 刷新時的難度係數 */
  difficulty: number
  /** 刷新時的章節層數 */
  chapter: number
}
