import type { IEquipmentInstance, IRelicInstance } from '@/features/item/interfaces/definitions/IItemInstance'
import type { IShopItem } from './IShopItem'

/**
 * 商店事件類型
 */
export type ShopEvents = {
  ShopRefreshed: { items: IShopItem[]; difficulty: number; chapter: number }
  ItemPurchased: { item: IEquipmentInstance | IRelicInstance; price: number }
  ItemSold: { itemId: string; price: number }
}
