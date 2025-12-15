/**
 * IItemDefinition
 *
 * 物品定義基礎介面。
 * 所有物品類型的共同屬性。
 */
export interface IItemDefinition {
  /** 物品唯一識別碼 */
  readonly id: string
  /** 顯示名稱 */
  readonly name?: string
  /** 描述文字 */
  readonly description?: string
  /** 圖示路徑 */
  readonly iconPath?: string
  /** 價格 */
  readonly price?: number
}
