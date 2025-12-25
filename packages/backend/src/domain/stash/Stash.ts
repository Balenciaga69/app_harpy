import { ItemInstance } from '../item/itemInstance'

export interface IStash {
  readonly items: ReadonlyArray<ItemInstance>
  readonly capacity: number

  // 基本操作
  addItem(item: ItemInstance): boolean
  removeItem(itemId: string): boolean
  takeItem(itemId: string): ItemInstance | null
  listItems(): ReadonlyArray<ItemInstance>
  getUsedCapacity(): number
  expandCapacity(newCapacity: number): boolean

  // 業務規則檢查
  canAddItem(item: ItemInstance): boolean
  hasItem(itemId: string): boolean
  isAtCapacity(): boolean
}

export class Stash implements IStash {
  private _items: ItemInstance[] = []
  private _capacity: number

  constructor(initialItems: ItemInstance[] = [], initialCapacity: number = 20) {
    this._items = [...initialItems]
    this._capacity = initialCapacity
  }

  get items(): ReadonlyArray<ItemInstance> {
    return this._items
  }

  get capacity(): number {
    return this._capacity
  }

  addItem(item: ItemInstance): boolean {
    if (!this.canAddItem(item)) return false
    this._items.push(item)
    return true
  }

  removeItem(itemId: string): boolean {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return false
    this._items.splice(idx, 1)
    return true
  }

  takeItem(itemId: string): ItemInstance | null {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return null
    const [item] = this._items.splice(idx, 1)
    return item || null
  }

  listItems(): ReadonlyArray<ItemInstance> {
    return this._items
  }

  getUsedCapacity(): number {
    return this._items.length
  }

  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= 0 || newCapacity < this._items.length) return false
    this._capacity = newCapacity
    return true
  }

  // 業務規則檢查方法
  canAddItem(item: ItemInstance): boolean {
    // 檢查容量
    if (this.isAtCapacity()) return false
    // 檢查物品是否已存在
    if (this.hasItem(item.id)) return false
    return true
  }

  hasItem(itemId: string): boolean {
    return this._items.some((i) => i.id === itemId)
  }

  isAtCapacity(): boolean {
    return this._items.length >= this._capacity
  }
}
