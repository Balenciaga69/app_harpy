/*
與 infra/app 的 static-config 有關

*/

import { Result } from '../../shared/result/Result'
import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { ItemAggregate, ItemRecord } from '../item/Item'
/** 商店配置介面 */
export interface ShopConfig {
  readonly discountRate: number
  readonly baseRefreshPrice: number
  readonly shopSlotCount: number
}
/** 商店 Record 介面 */
export interface ShopRecord {
  readonly items: ReadonlyArray<ItemRecord>
}

export class Shop {
  public items: ReadonlyArray<ItemAggregate> = []
  private config: ShopConfig
  constructor(items: ReadonlyArray<ItemAggregate>, config: ShopConfig) {
    this.items = items
    this.config = config
  }
  // 添加物品
  addItem(item: ItemAggregate): Result<Shop, DomainErrorCode.商店格子已滿> {
    const { shopSlotCount } = this.config
    if (this.items.length >= shopSlotCount) {
      return Result.fail(DomainErrorCode.商店格子已滿)
    }
    return Result.success(new Shop([...this.items, item], this.config))
  }
  // 移除物品
  removeItem(itemId: string): Result<Shop, DomainErrorCode.商店物品不存在> {
    const newItems = this.items.filter((i) => i.record.id !== itemId)
    if (newItems.length === this.items.length) {
      return Result.fail(DomainErrorCode.商店物品不存在)
    }
    return Result.success(new Shop(newItems, this.config))
  }
}
