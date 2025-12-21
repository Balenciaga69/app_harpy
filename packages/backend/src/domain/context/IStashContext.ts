import { ItemInstance } from '../item/itemInstance'

export interface IStashContext {
  readonly id: string
  readonly items: readonly ItemInstance[]
}
