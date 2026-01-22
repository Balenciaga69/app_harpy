import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { Result } from '../../shared/result/Result'
import { ItemEntity, ItemRecord } from '../item/Item'
import { PriceHelper } from './PriceHelper'
import { ShopConfig } from './ShopConfig'
export interface ShopItemRecord extends ItemRecord {
  readonly price: number
  readonly isDiscounted: boolean
}
export interface ShopRecord {
  readonly items: ReadonlyArray<ShopItemRecord>
}
export interface ShopItemEntity {
  readonly itemEntity: ItemEntity
  readonly record: ShopItemRecord
}
export class Shop {
  private readonly _items: ReadonlyArray<ShopItemEntity>
  private readonly _config: ShopConfig
  constructor(items: ReadonlyArray<ShopItemEntity> = [], config: ShopConfig) {
    this._items = items
    this._config = config
  }
  public get items(): ReadonlyArray<ShopItemEntity> {
    return this._items
  }
  public get config(): ShopConfig {
    return this._config
  }
  public getItem(itemId: string): Result<ShopItemEntity> {
    const foundItem = this._items.find((index) => index.itemEntity.record.id === itemId)
    if (!foundItem) return Result.fail(DomainErrorCode.商店_商店物品不存在)
    return Result.success(foundItem)
  }
  addItem(item: ItemEntity): Result<Shop> {
    const { shopSlotCount } = this._config
    if (this._items.length >= shopSlotCount) {
      return Result.fail(DomainErrorCode.商店_商店格子已滿)
    }
    const shopItem = this.convertToShopItemEntity(item)
    return Result.success(new Shop([...this._items, shopItem], this._config))
  }
  addManyItems(items: ReadonlyArray<ItemEntity>): Result<Shop> {
    const { shopSlotCount } = this._config
    if (this._items.length + items.length > shopSlotCount) {
      return Result.fail(DomainErrorCode.商店_商店格子已滿)
    }
    const shopItems = items.map((item) => this.convertToShopItemEntity(item))
    return Result.success(new Shop([...this._items, ...shopItems], this._config))
  }
  removeItem(itemId: string): Result<Shop> {
    const newItems = this._items.filter((index) => index.itemEntity.record.id !== itemId)
    if (newItems.length === this._items.length) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    return Result.success(new Shop(newItems, this._config))
  }
  clearItems(): Shop {
    return new Shop([], this._config)
  }
  setRarestItemAsDiscount(): Result<Shop> {
    if (this._items.length === 0) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    const rarestItem = this._items.reduce((previous, current) => {
      return current.itemEntity.template.rarity > previous.itemEntity.template.rarity ? current : previous
    })
    return this.discountItem(rarestItem.itemEntity.record.id)
  }
  discountItem(itemId: string): Result<Shop, DomainErrorCode.商店_商店物品不存在> {
    const itemIndex = this._items.findIndex((index) => index.itemEntity.record.id === itemId)
    if (itemIndex === -1) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    const targetItem = this._items[itemIndex]
    const difficulty = targetItem.itemEntity.record.atCreated.difficulty
    const rarity = targetItem.itemEntity.template.rarity
    const discountedPrice = PriceHelper.calculateItemPrice({
      config: this._config,
      difficulty,
      rarity,
      isBuying: true,
      isDiscounted: true,
    })
    const newShopItem: ShopItemEntity = {
      itemEntity: targetItem.itemEntity,
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
  public getSellPrice(item: ItemEntity): number {
    return PriceHelper.calculateItemPrice({
      config: this._config,
      difficulty: item.record.atCreated.difficulty,
      rarity: item.template.rarity,
      isBuying: false,
      isDiscounted: false,
    })
  }
  private convertToShopItemEntity(itemEntity: ItemEntity): ShopItemEntity {
    const price = PriceHelper.calculateItemPrice({
      config: this._config,
      difficulty: itemEntity.record.atCreated.difficulty,
      rarity: itemEntity.template.rarity,
      isBuying: true,
      isDiscounted: false,
    })
    return {
      itemEntity,
      record: {
        ...itemEntity.record,
        price,
        isDiscounted: false,
      },
    }
  }
}
