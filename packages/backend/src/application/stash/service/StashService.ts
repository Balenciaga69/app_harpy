import { Stash } from '../../../domain/stash/Stash'
import { IStashContext } from '../../core-infrastructure/context/interface/IStashContext'
import { ItemInstance } from '../../../domain/item/itemInstance'

export interface IStashService {
  /** 從 context 載入 Stash domain 物件 */
  loadFromContext(context: IStashContext): Stash

  /** 將 Stash domain 物件轉為 context，準備儲存 */
  toContext(stash: Stash): IStashContext

  /** 存取資料庫（repository）取得 Stash context */
  fetchStashContext(playerId: string): Promise<IStashContext>

  /** 儲存 Stash context 到資料庫 */
  saveStashContext(playerId: string, context: IStashContext): Promise<void>

  /** 玩家存放物品到倉庫 */
  addItemToStash(playerId: string, item: ItemInstance): Promise<boolean>

  /** 玩家從倉庫取出物品 */
  takeItemFromStash(playerId: string, itemId: string, count?: number): Promise<ItemInstance | null>

  /** 擴充倉庫容量 */
  expandStashCapacity(playerId: string, amount: number): Promise<void>

  /** 查詢玩家倉庫內容 */
  getStashItems(playerId: string): Promise<ReadonlyArray<ItemInstance>>
}

export class StashService implements IStashService {
  // TODO: 注入 repository 依賴

  loadFromContext(context: IStashContext): Stash {
    // TODO: context 轉 domain
    throw new Error('Not implemented')
  }

  toContext(stash: Stash): IStashContext {
    // TODO: domain 轉 context
    throw new Error('Not implemented')
  }

  async fetchStashContext(playerId: string): Promise<IStashContext> {
    // TODO: 從 repository 取得 context
    throw new Error('Not implemented')
  }

  async saveStashContext(playerId: string, context: IStashContext): Promise<void> {
    // TODO: 儲存 context 到 repository
    throw new Error('Not implemented')
  }

  async addItemToStash(playerId: string, item: ItemInstance): Promise<boolean> {
    // TODO: 取得 context -> domain，執行 addItem，儲存
    throw new Error('Not implemented')
  }

  async takeItemFromStash(playerId: string, itemId: string, count?: number): Promise<ItemInstance | null> {
    // TODO: 取得 context -> domain，執行 takeItem，儲存
    throw new Error('Not implemented')
  }

  async expandStashCapacity(playerId: string, amount: number): Promise<void> {
    // TODO: 取得 context -> domain，執行 expandCapacity，儲存
    throw new Error('Not implemented')
  }

  async getStashItems(playerId: string): Promise<ReadonlyArray<ItemInstance>> {
    // TODO: 取得 context，回傳 items
    throw new Error('Not implemented')
  }
}
