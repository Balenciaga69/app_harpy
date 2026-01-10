import type { IEquipmentInstance, IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'
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
