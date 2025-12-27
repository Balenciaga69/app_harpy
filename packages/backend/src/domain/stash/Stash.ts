import { ItemAggregate, ItemRecord } from '../item/Item'

const INITIAL_CAPACITY = 20
export interface StashRecord {
  readonly items: ReadonlyArray<ItemRecord>
  readonly capacity: number
}
// Stash 類負責管理玩家的背包邏輯。
// - 提供基本的背包操作（新增、移除、列出物品等）。
// - 確保背包操作符合業務邏輯（如容量限制、物品唯一性）。
// - 支援背包容量的動態擴展。
export class Stash {
  private _items: ItemAggregate[] = []
  private _capacity: number
  constructor(initialItems: ItemAggregate[] = [], initialCapacity: number = INITIAL_CAPACITY) {
    this._items = [...initialItems]
    this._capacity = initialCapacity
  }
  get items(): ReadonlyArray<ItemAggregate> {
    return this._items
  }
  get capacity(): number {
    return this._capacity
  }
  // 嘗試新增物品到背包。
  addItem(item: ItemAggregate): boolean {
    if (this.isAtCapacity()) return false
    this._items.push(item)
    return true
  }
  // 嘗試從背包移除物品。
  removeItem(itemId: string): boolean {
    const idx = this._items.findIndex((i) => i.record.id === itemId)
    if (idx === -1) return false
    this._items.splice(idx, 1)
    return true
  }
  // 嘗試從背包中取出物品。
  takeItem(itemId: string): ItemAggregate | null {
    const idx = this._items.findIndex((i) => i.record.id === itemId)
    if (idx === -1) return null
    const [item] = this._items.splice(idx, 1)
    return item || null
  }
  // 列出背包中的所有物品。
  listItems(): ReadonlyArray<ItemAggregate> {
    return this._items
  }
  // 獲取背包已使用的容量。
  getUsedCapacity(): number {
    return this._items.length
  }
  // 嘗試擴展背包容量。
  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= 0 || newCapacity < this._items.length) return false
    this._capacity = newCapacity
    return true
  }
  // 檢查背包中是否包含指定物品。
  hasItem(itemId: string): boolean {
    return this._items.some((i) => i.record.id === itemId)
  }
  // 檢查背包是否已達容量上限。
  isAtCapacity(): boolean {
    return this._items.length >= this._capacity
  }
}
