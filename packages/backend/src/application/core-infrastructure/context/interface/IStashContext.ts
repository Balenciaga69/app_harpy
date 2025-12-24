import { ItemInstance } from '../../../../domain/item/itemInstance'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface IStashContext extends WithRunIdAndVersion {
  readonly items: readonly ItemInstance[]
}
