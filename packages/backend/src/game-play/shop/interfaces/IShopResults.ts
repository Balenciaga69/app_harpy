import type { IEquipmentInstance, IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'
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
