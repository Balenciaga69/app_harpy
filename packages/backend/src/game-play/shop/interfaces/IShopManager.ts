import type { Emitter } from 'mitt'
import type { IShopConfig } from './IShopConfig'
import type { ShopEvents } from './ShopEvents'
import type { IInventoryAdapter, IDifficultyAdapter, IItemGenerator } from './adapters/IShopAdapters'
import type { IShopItem } from './IShopItem'
import type { IPurchaseResult, ISellResult } from './IShopResults'
import type { IRefreshResult } from './IRefreshResult'

/**
 * ShopManager 介面
 *
 * 商店管理器的核心介面，定義所有商店操作
 */
export interface IShopManager {
  /** 獲取當前商品列表 */
  getItems(): IShopItem[]

  /** 刷新商店（生成新商品） */
  refresh(chapter: number): IRefreshResult

  /** 購買商品 */
  purchase(itemId: string): IPurchaseResult

  /** 出售物品 */
  sell(itemId: string): ISellResult

  /** 獲取當前配置 */
  getConfig(): IShopConfig
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
  itemGenerator?: IItemGenerator
}
