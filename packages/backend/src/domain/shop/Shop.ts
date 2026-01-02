import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { Result } from '../../shared/result/Result'
import { ItemAggregate, ItemRecord } from '../item/Item'
import { ShopConfig } from './ShopConfig'
import { PriceHelper } from './PriceHelper'
// === Record ===
export interface ShopItemRecord extends ItemRecord {
  readonly price: number
  readonly isDiscounted: boolean
}
/** 商店 Record 介面 */
export interface ShopRecord {
  readonly items: ReadonlyArray<ShopItemRecord>
}
// === Domain ===
/** 商店物品聚合，包含物品聚合與價格資訊 */
export interface ShopItemAggregate {
  readonly itemAggregate: ItemAggregate // 物品聚合
  readonly record: ShopItemRecord
}
/**  Shop Class 管理商店物品與操作 */
export class Shop {
  private readonly _items: ReadonlyArray<ShopItemAggregate>
  private readonly _config: ShopConfig
  constructor(items: ReadonlyArray<ShopItemAggregate> = [], config: ShopConfig) {
    this._items = items
    this._config = config
  }
  // ====== public getters ======
  public get items(): ReadonlyArray<ShopItemAggregate> {
    return this._items
  }
  public get config(): ShopConfig {
    return this._config
  }
  /** 尋找並返回指定ID的物品 */
  public getItem(itemId: string): Result<ShopItemAggregate> {
    const foundItem = this._items.find((i) => i.itemAggregate.record.id === itemId)
    if (!foundItem) return Result.fail(DomainErrorCode.商店_商店物品不存在)
    return Result.success(foundItem)
  }
  /** 添加物品 */
  addItem(item: ItemAggregate): Result<Shop> {
    const { shopSlotCount } = this._config
    if (this._items.length >= shopSlotCount) {
      return Result.fail(DomainErrorCode.商店_商店格子已滿)
    }
    const shopItem = this.convertToShopItemAggregate(item)
    return Result.success(new Shop([...this._items, shopItem], this._config))
  }
  /** 批量添加物品 */
  addManyItems(items: ReadonlyArray<ItemAggregate>): Result<Shop> {
    const { shopSlotCount } = this._config
    if (this._items.length + items.length > shopSlotCount) {
      return Result.fail(DomainErrorCode.商店_商店格子已滿)
    }
    const shopItems = items.map((item) => this.convertToShopItemAggregate(item))
    return Result.success(new Shop([...this._items, ...shopItems], this._config))
  }
  /** 移除物品 */
  removeItem(itemId: string): Result<Shop> {
    const newItems = this._items.filter((i) => i.itemAggregate.record.id !== itemId)
    if (newItems.length === this._items.length) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    return Result.success(new Shop(newItems, this._config))
  }
  /** 清空 */
  clearItems(): Shop {
    return new Shop([], this._config)
  }
  /** 將店內最稀有的物品設為折扣 */
  setRarestItemAsDiscount(): Result<Shop> {
    if (this._items.length === 0) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    // 找出最稀有的物品
    const rarestItem = this._items.reduce((prev, current) => {
      return current.itemAggregate.template.rarity > prev.itemAggregate.template.rarity ? current : prev
    })
    // 折扣該物品
    return this.discountItem(rarestItem.itemAggregate.record.id)
  }
  /** 折扣某一件物品 */
  discountItem(itemId: string): Result<Shop, DomainErrorCode.商店_商店物品不存在> {
    const itemIndex = this._items.findIndex((i) => i.itemAggregate.record.id === itemId)
    if (itemIndex === -1) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    const targetItem = this._items[itemIndex]
    const difficulty = targetItem.itemAggregate.record.atCreated.difficulty
    const rarity = targetItem.itemAggregate.template.rarity
    const discountedPrice = PriceHelper.calculateItemPrice({
      config: this._config,
      difficulty,
      rarity,
      isBuying: true,
      isDiscounted: true,
    })
    const newShopItem: ShopItemAggregate = {
      itemAggregate: targetItem.itemAggregate,
      record: {
        ...targetItem.record,
        price: discountedPrice,
        isDiscounted: true,
      },
    }
    const newItems = [...this._items]
    newItems[itemIndex] = newShopItem
    return Result.success(new Shop(newItems, this._config))
  }
  /** 取得出售報價 */
  public getSellPrice(item: ItemAggregate): number {
    return PriceHelper.calculateItemPrice({
      config: this._config,
      difficulty: item.record.atCreated.difficulty,
      rarity: item.template.rarity,
      isBuying: false,
      isDiscounted: false,
    })
  }
  /** 將"物品"轉換為"商店物品"，包含價格計算 */
  private convertToShopItemAggregate(itemAggregate: ItemAggregate): ShopItemAggregate {
    const price = PriceHelper.calculateItemPrice({
      config: this._config,
      difficulty: itemAggregate.record.atCreated.difficulty,
      rarity: itemAggregate.template.rarity,
      isBuying: true,
      isDiscounted: false,
    })
    return {
      itemAggregate,
      record: {
        ...itemAggregate.record,
        price,
        isDiscounted: false,
      },
    }
  }
}
