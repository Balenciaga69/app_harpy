import { DomainErrorCode } from '../../shared/result/ErrorCodes'
import { Result } from '../../shared/result/Result'
import { ItemEntity, ItemRecord } from '../item/Item'
const INITIAL_CAPACITY = 20
export interface StashRecord {
  readonly items: ReadonlyArray<ItemRecord>
  readonly capacity: number
}

export class Stash {
  private _items: ReadonlyArray<ItemEntity> = []
  private _capacity: number
  constructor(initialItems: ReadonlyArray<ItemEntity> = [], initialCapacity: number = INITIAL_CAPACITY) {
    this._items = [...initialItems]
    this._capacity = initialCapacity
  }

  public get items(): ReadonlyArray<ItemEntity> {
    return this._items
  }
  public get capacity(): number {
    return this._capacity
  }

  public addItem(item: ItemEntity): Result<Stash, DomainErrorCode.倉庫_倉庫已滿> {
    if (this.isAtCapacity()) {
      return Result.fail(DomainErrorCode.倉庫_倉庫已滿)
    }
    return Result.success(new Stash([...this.items, item], this.capacity))
  }

  public removeItem(itemId: string): Result<Stash, DomainErrorCode.倉庫_物品不存在> {
    const newItems = this.items.filter((i) => i.record.id !== itemId)
    if (newItems.length === this.items.length) {
      return Result.fail(DomainErrorCode.倉庫_物品不存在)
    }
    return Result.success(new Stash(newItems, this.capacity))
  }

  public getItem(itemId: string): ItemEntity | null {
    const item = this._items.find((i) => i.record.id === itemId) || null
    if (!item) return null
    return item
  }

  public listItems(): ReadonlyArray<ItemEntity> {
    return this._items
  }

  public getUsedCapacity(): number {
    return this._items.length
  }

  public expandCapacity(newCapacity: number): Result<Stash, DomainErrorCode.倉庫_容量設定無效> {
    if (newCapacity <= this.items.length) {
      return Result.fail(DomainErrorCode.倉庫_容量設定無效)
    }
    return Result.success(new Stash(this.items, newCapacity))
  }

  public hasItem(itemId: string): boolean {
    return this._items.some((i) => i.record.id === itemId)
  }

  public isAtCapacity(): boolean {
    return this._items.length >= this._capacity
  }
}
