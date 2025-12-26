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
/**
 * Stash 類負責管理玩家的背包邏輯。
 * - 提供基本的背包操作（新增、移除、列出物品等）。
 * - 確保背包操作符合業務邏輯（如容量限制、物品唯一性）。
 * - 支援背包容量的動態擴展。
 */
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
  /**
   * //TODO: 從多行改單行
   * 嘗試新增物品到背包。
   */
  addItem(item: ItemInstance): boolean {
    if (!this.canAddItem(item)) return false
    this._items.push(item)
    return true
  }
  /**
   * //TODO: 從多行改單行
   * 嘗試從背包移除物品。
   */
  removeItem(itemId: string): boolean {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return false
    this._items.splice(idx, 1)
    return true
  }
  /**
   * //TODO: 從多行改單行
   * 嘗試從背包中取出物品。
   */
  takeItem(itemId: string): ItemInstance | null {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return null
    const [item] = this._items.splice(idx, 1)
    return item || null
  }
  /**
   * //TODO: 從多行改單行
   * 列出背包中的所有物品。
   */
  listItems(): ReadonlyArray<ItemInstance> {
    return this._items
  }
  /**
   * //TODO: 從多行改單行
   * 獲取背包已使用的容量。
   */
  getUsedCapacity(): number {
    return this._items.length
  }
  /**
   * //TODO: 從多行改單行
   * 嘗試擴展背包容量。
   */
  expandCapacity(newCapacity: number): boolean {
    if (newCapacity <= 0 || newCapacity < this._items.length) return false
    this._capacity = newCapacity
    return true
  }
  /**
   * //TODO: 從多行改單行
   * 檢查是否可以新增物品到背包。
   */
  canAddItem(item: ItemInstance): boolean {
    // 檢查容量
    if (this.isAtCapacity()) return false
    // 檢查物品是否已存在
    if (this.hasItem(item.id)) return false
    return true
  }
  /**
   * //TODO: 從多行改單行
   * 檢查背包中是否包含指定物品。
   */
  hasItem(itemId: string): boolean {
    return this._items.some((i) => i.id === itemId)
  }
  /**
   * //TODO: 從多行改單行
   * 檢查背包是否已達容量上限。
   */
  isAtCapacity(): boolean {
    return this._items.length >= this._capacity
  }
}
