import { RelicInstance } from '../../../../domain/item/itemInstance'
import { UltimateInstance } from '../../../../domain/ultimate/UltimateInstance'
import { WithRunIdAndVersion } from './WithRunIdAndVersion'
export interface ICharacterContext extends WithRunIdAndVersion {
  readonly characterId: string
  readonly name: string
  readonly professionId: string
  readonly relics: RelicInstance[]
  readonly ultimate: UltimateInstance
  readonly loadCapacity: number
}
