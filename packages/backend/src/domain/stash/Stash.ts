import { ItemInstance } from '../item/itemInstance'

export interface IStash {
  readonly items: ReadonlyArray<ItemInstance>
  readonly capacity: number

  addItem(item: ItemInstance): boolean
  removeItem(itemId: string, count?: number): boolean
  takeItem(itemId: string, count?: number): ItemInstance | null
  listItems(): ReadonlyArray<ItemInstance>
  getUsedCapacity(): number
  expandCapacity(amount: number): void
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
    if (this._items.length >= this._capacity) return false
    this._items.push(item)
    return true
  }

  removeItem(itemId: string, count: number = 1): boolean {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return false
    this._items.splice(idx, count)
    return true
  }

  takeItem(itemId: string, count: number = 1): ItemInstance | null {
    const idx = this._items.findIndex((i) => i.id === itemId)
    if (idx === -1) return null
    const [item] = this._items.splice(idx, count)
    return item || null
  }

  listItems(): ReadonlyArray<ItemInstance> {
    return this._items
  }

  getUsedCapacity(): number {
    return this._items.length
  }

  expandCapacity(amount: number): void {
    this._capacity += amount
  }
}
