import { Result } from '../../shared/result/Result'
import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { ItemAggregate, ItemRecord } from '../item/Item'
const INITIAL_CAPACITY = 20
export interface StashRecord {
  readonly items: ReadonlyArray<ItemRecord>
  readonly capacity: number
}
// Stash 類負責管理玩家的倉庫邏輯。
// - 提供基本的倉庫操作( 新增、移除、列出物品等 )。
// - 確保倉庫操作符合業務邏輯( 如容量限制、物品唯一性 )。
// - 支援倉庫容量的動態擴展。
export class Stash {
  private _items: ReadonlyArray<ItemAggregate> = []
  private _capacity: number
  constructor(initialItems: ReadonlyArray<ItemAggregate> = [], initialCapacity: number = INITIAL_CAPACITY) {
    this._items = [...initialItems]
    this._capacity = initialCapacity
  }
  // ====== public methods ======
  public get items(): ReadonlyArray<ItemAggregate> {
    return this._items
  }
  public get capacity(): number {
    return this._capacity
  }
  /** 試試新增物品到倉庫。*/
  public addItem(item: ItemAggregate): Result<Stash, DomainErrorCode.倉庫_倉庫已滿> {
    if (this.isAtCapacity()) {
      return Result.fail(DomainErrorCode.倉庫_倉庫已滿)
    }
    return Result.success(new Stash([...this.items, item], this.capacity))
  }
  /** 試試從倉庫移除物品。*/
  public removeItem(itemId: string): Result<Stash, DomainErrorCode.倉庫_物品不存在> {
    const newItems = this.items.filter((i) => i.record.id !== itemId)
    if (newItems.length === this.items.length) {
      return Result.fail(DomainErrorCode.倉庫_物品不存在)
    }
    return Result.success(new Stash(newItems, this.capacity))
  }
  /** 嘗試從倉庫中取出物品。*/
  public getItem(itemId: string): ItemAggregate | null {
    const item = this._items.find((i) => i.record.id === itemId) || null
    if (!item) return null
    return item
  }
  /** 列出倉庫中的所有物品。*/
  public listItems(): ReadonlyArray<ItemAggregate> {
    return this._items
  }
  /** 獲取倉庫已使用的容量。*/
  public getUsedCapacity(): number {
    return this._items.length
  }
  /** 試試擴展倉庫容量。*/
  public expandCapacity(newCapacity: number): Result<Stash, DomainErrorCode.倉庫_容量設定無效> {
    if (newCapacity <= this.items.length) {
      return Result.fail(DomainErrorCode.倉庫_容量設定無效)
    }
    return Result.success(new Stash(this.items, newCapacity))
  }
  /** 檢查倉庫中是否包含指定物品。*/
  public hasItem(itemId: string): boolean {
    return this._items.some((i) => i.record.id === itemId)
  }
  /** 檢查倉庫是否已達容量上限。*/
  public isAtCapacity(): boolean {
    return this._items.length >= this._capacity
  }
}
