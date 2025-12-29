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
  /** 嘗試新增物品到倉庫。*/
  public addItem(item: ItemAggregate): boolean {
    if (this.isAtCapacity()) return false
    this._items = [...this._items, item]
    return true
  }
  /** 嘗試從倉庫移除物品。*/
  public removeItem(itemId: string): boolean {
    const hasItem = this._items.some((i) => i.record.id === itemId)
    if (!hasItem) return false
    this._items = this._items.filter((i) => i.record.id !== itemId)
    return true
  }
  /** 嘗試從倉庫中取出物品。*/
  public takeItem(itemId: string): ItemAggregate | null {
    const item = this._items.find((i) => i.record.id === itemId) || null
    if (!item) return null
    this._items = this._items.filter((i) => i.record.id !== itemId)
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
  /** 嘗試擴展倉庫容量。*/
  public expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= 0 || newCapacity < this._items.length) return false
    this._capacity = newCapacity
    return true
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
