import { Result } from '../../shared/result/Result'
import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { ItemAggregate, ItemRarity, ItemRecord } from '../item/Item'
/** 商店配置介面 */
export interface ShopConfig {
  readonly id: string // 商店配置ID
  readonly discountRate: number // 折扣率
  readonly baseRefreshPrice: number // 基礎刷新價格
  readonly shopSlotCount: number // 商店格子數量
  readonly rarityPriceTable: Record<ItemRarity, number> // 稀有度價格表
  readonly difficultyMultiplier: number // 難度係數
  readonly salePriceDepreciationRate: number // 出售價格折舊率
}
/** 商店物品聚合，包含物品聚合與價格資訊 */
export interface ShopItemAggregate {
  readonly itemAggregate: ItemAggregate // 物品聚合
  readonly price: number // 物品價格
}
/** 商店 Record 介面 */
export interface ShopRecord {
  readonly items: ReadonlyArray<ItemRecord>
}
/** 商店類，管理商店物品與操作 */
export class Shop {
  public items: ReadonlyArray<ShopItemAggregate> = []
  private config: ShopConfig
  constructor(items: ReadonlyArray<ShopItemAggregate>, config: ShopConfig) {
    this.items = items
    this.config = config
  }
  /** 添加物品 */
  addItem(item: ItemAggregate, difficulty: number): Result<Shop, DomainErrorCode.商店_商店格子已滿> {
    const { shopSlotCount } = this.config
    if (this.items.length >= shopSlotCount) {
      return Result.fail(DomainErrorCode.商店_商店格子已滿)
    }
    const shopItem = this.convertToShopItemAggregate(item, difficulty)
    return Result.success(new Shop([...this.items, shopItem], this.config))
  }
  /** 批量添加物品 */
  addManyItems(
    items: ReadonlyArray<ItemAggregate>,
    difficulty: number
  ): Result<Shop, DomainErrorCode.商店_商店格子已滿> {
    const { shopSlotCount } = this.config
    if (this.items.length + items.length > shopSlotCount) {
      return Result.fail(DomainErrorCode.商店_商店格子已滿)
    }
    const shopItems = items.map((item) => this.convertToShopItemAggregate(item, difficulty))
    return Result.success(new Shop([...this.items, ...shopItems], this.config))
  }
  /** 移除物品 */
  removeItem(itemId: string): Result<Shop, DomainErrorCode.商店_商店物品不存在> {
    const newItems = this.items.filter((i) => i.itemAggregate.record.id !== itemId)
    if (newItems.length === this.items.length) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    return Result.success(new Shop(newItems, this.config))
  }
  /** 清空 */
  clearItems(): Shop {
    return new Shop([], this.config)
  }
  /** 折扣某一件物品 */
  discountItem(itemId: string): Result<Shop, DomainErrorCode.商店_商店物品不存在> {
    const itemIndex = this.items.findIndex((i) => i.itemAggregate.record.id === itemId)
    if (itemIndex === -1) {
      return Result.fail(DomainErrorCode.商店_商店物品不存在)
    }
    const targetItem = this.items[itemIndex]
    const difficulty = targetItem.itemAggregate.record.atCreated.difficulty
    const rarity = targetItem.itemAggregate.template.rarity
    const discountedPrice = ShopHelper.calculateItemPrice({
      config: this.config,
      difficulty,
      rarity,
      isBuying: true,
      isDiscounted: true,
    })
    const newShopItem: ShopItemAggregate = {
      itemAggregate: targetItem.itemAggregate,
      price: discountedPrice,
    }
    const newItems = [...this.items]
    newItems[itemIndex] = newShopItem
    return Result.success(new Shop(newItems, this.config))
  }
  /** 取得出售報價 */
  public getSellPrice(item: ItemAggregate): number {
    return ShopHelper.calculateItemPrice({
      config: this.config,
      difficulty: item.record.atCreated.difficulty,
      rarity: item.template.rarity,
      isBuying: false,
      isDiscounted: false,
    })
  }
  /** 將"物品"轉換為"商店物品"，包含價格計算 */
  private convertToShopItemAggregate(itemAggregate: ItemAggregate, difficulty: number): ShopItemAggregate {
    const price = ShopHelper.calculateItemPrice({
      config: this.config,
      difficulty: difficulty,
      rarity: itemAggregate.template.rarity,
      isBuying: true,
      isDiscounted: false,
    })
    return {
      itemAggregate,
      price,
    }
  }
}

interface PriceCalculationParams {
  readonly config: ShopConfig
  readonly difficulty: number
  readonly rarity: ItemRarity
  readonly isBuying: boolean
  readonly isDiscounted: boolean
}

/** 商店相關輔助函數 */
export const ShopHelper = {
  /** 計算物品價格 */
  calculateItemPrice(params: PriceCalculationParams): number {
    const { config, difficulty, rarity, isBuying, isDiscounted } = params
    const basePrice = config.rarityPriceTable[rarity]
    const discountFactor = isDiscounted ? 1 - config.discountRate : 1
    const priceWithDifficulty = Math.floor(basePrice * (1 + difficulty * config.difficultyMultiplier)) * discountFactor
    return isBuying ? priceWithDifficulty : Math.floor(priceWithDifficulty * 1 - config.salePriceDepreciationRate)
  },
}
