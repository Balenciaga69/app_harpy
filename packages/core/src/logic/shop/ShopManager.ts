/**
 * ShopManager
 *
 * 商店模組的核心控制器。
 * 負責商品生成、購買/出售交易、價格計算與事件通知。
 */
import { nanoid } from 'nanoid'
import type { Emitter } from 'mitt'
import type { IEquipmentInstance, IRelicInstance } from '@/domain/item'
import { ItemGenerator } from '@/logic/item-generator'
import type { IShopConfig, IShopItem, IPurchaseResult, ISellResult, IRefreshResult } from './models'
import { PricingEngine } from './pricing'
import { InsufficientFundsError, ItemNotFoundError, InvalidItemError } from './errors'
/**
 * 商店事件類型
 */
export type ShopEvents = {
  ShopRefreshed: { items: IShopItem[]; difficulty: number; chapter: number }
  ItemPurchased: { item: IEquipmentInstance | IRelicInstance; price: number }
  ItemSold: { itemId: string; price: number }
}
/**
 * 庫存介面（用於依賴注入）
 */
export interface IInventoryAdapter {
  getPlayerGold(): number
  updatePlayerGold(amount: number): void
  addItemToInventory(item: IEquipmentInstance | IRelicInstance): void
  removeItemFromInventory(itemId: string): void
  hasItem(itemId: string): boolean
}
/**
 * 難度適配器介面
 */
export interface IDifficultyAdapter {
  getCurrentDifficulty(): number
}
/**
 * ShopManager 配置
 */
export interface IShopManagerConfig {
  /** 商店配置 */
  shopConfig: IShopConfig
  /** 事件總線 */
  eventBus: Emitter<ShopEvents>
  /** 庫存適配器 */
  inventory: IInventoryAdapter
  /** 難度適配器 */
  difficultyAdapter: IDifficultyAdapter
  /** 物品生成器（可選，預設創建新實例） */
  itemGenerator?: ItemGenerator
}
/**
 * 商店管理器
 */
export class ShopManager {
  private readonly config: IShopConfig
  private readonly eventBus: Emitter<ShopEvents>
  private readonly inventory: IInventoryAdapter
  private readonly difficultyAdapter: IDifficultyAdapter
  private readonly itemGenerator: ItemGenerator
  private readonly pricingEngine: PricingEngine
  private currentItems: IShopItem[] = []
  private currentChapter: number = 1
  constructor(config: IShopManagerConfig) {
    this.config = config.shopConfig
    this.eventBus = config.eventBus
    this.inventory = config.inventory
    this.difficultyAdapter = config.difficultyAdapter
    this.itemGenerator = config.itemGenerator ?? new ItemGenerator()
    this.pricingEngine = PricingEngine.fromShopConfig(this.config)
  }
  /** 刷新商品清單 */
  refresh(): IRefreshResult {
    const difficulty = this.difficultyAdapter.getCurrentDifficulty()
    const itemCount = this.generateItemCount()
    const newItems: IShopItem[] = []
    for (let i = 0; i < itemCount; i++) {
      const seed = nanoid()
      const isEquipment = Math.random() > 0.3 // 70% 裝備，30% 遺物
      if (isEquipment) {
        // TODO: 這裡需要從裝備池隨機選擇一個定義 ID
        // 暫時使用硬編碼的定義 ID 作為示例
        const equipmentDefinitionId = 'basic-sword' // 應該從池子隨機選
        const equipment = this.itemGenerator.generateEquipment(equipmentDefinitionId, difficulty, seed)
        const price = this.pricingEngine.calculateBuyPrice(equipment.rarity, difficulty, this.currentChapter)
        newItems.push({
          id: nanoid(),
          item: equipment,
          price,
          type: 'equipment',
        })
      } else {
        // TODO: 這裡需要從遺物池隨機選擇一個定義 ID
        const relicDefinitionId = 'basic-relic' // 應該從池子隨機選
        const relic = this.itemGenerator.generateRelic(relicDefinitionId)
        // 遺物沒有稀有度，使用固定價格或其他邏輯
        const price = 100 // 暫時固定價格
        newItems.push({
          id: nanoid(),
          item: relic,
          price,
          type: 'relic',
        })
      }
    }
    this.currentItems = newItems
    // 發佈事件
    this.eventBus.emit('ShopRefreshed', {
      items: newItems,
      difficulty,
      chapter: this.currentChapter,
    })
    return {
      items: newItems,
      difficulty,
      chapter: this.currentChapter,
    }
  }
  /** 購買商品 */
  purchase(shopItemId: string): IPurchaseResult {
    const shopItem = this.currentItems.find((item) => item.id === shopItemId)
    if (!shopItem) {
      throw new ItemNotFoundError(shopItemId)
    }
    const playerGold = this.inventory.getPlayerGold()
    if (playerGold < shopItem.price) {
      throw new InsufficientFundsError(shopItem.price, playerGold)
    }
    // 執行交易
    this.inventory.updatePlayerGold(-shopItem.price)
    this.inventory.addItemToInventory(shopItem.item)
    // 從商品清單移除
    this.currentItems = this.currentItems.filter((item) => item.id !== shopItemId)
    // 發佈事件
    this.eventBus.emit('ItemPurchased', {
      item: shopItem.item,
      price: shopItem.price,
    })
    return {
      success: true,
      item: shopItem.item,
      goldSpent: shopItem.price,
    }
  }
  /** 出售物品 */
  sell(itemId: string): ISellResult {
    if (!this.inventory.hasItem(itemId)) {
      throw new ItemNotFoundError(itemId)
    }
    // TODO: 需要從庫存取得物品以計算價格
    // 目前暫時使用固定價格
    const difficulty = this.difficultyAdapter.getCurrentDifficulty()
    const sellPrice = this.pricingEngine.calculateSellPrice('common', difficulty, this.currentChapter)
    // 執行交易
    this.inventory.removeItemFromInventory(itemId)
    this.inventory.updatePlayerGold(sellPrice)
    // 發佈事件
    this.eventBus.emit('ItemSold', {
      itemId,
      price: sellPrice,
    })
    return {
      success: true,
      goldEarned: sellPrice,
    }
  }
  /** 取得當前商品清單 */
  getCurrentItems(): IShopItem[] {
    return [...this.currentItems]
  }
  /** 設定當前章節（用於價格通膨） */
  setChapter(chapter: number): void {
    if (chapter < 1) {
      throw new InvalidItemError('章節層數必須大於 0')
    }
    this.currentChapter = chapter
  }
  /** 產生隨機商品數量 */
  private generateItemCount(): number {
    const { minItemsPerRefresh, maxItemsPerRefresh } = this.config
    const range = maxItemsPerRefresh - minItemsPerRefresh
    return minItemsPerRefresh + Math.floor(Math.random() * (range + 1))
  }
}
