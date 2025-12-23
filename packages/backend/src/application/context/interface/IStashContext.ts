import { ItemInstance } from '../../../domain/item/itemInstance'
export interface IStashContext {
  readonly id: string
  readonly version: number
  readonly items: readonly ItemInstance[]
}
