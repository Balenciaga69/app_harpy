import { RelicInstance } from '../../../domain/item/itemInstance'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'
export interface ICharacterContext {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly relics: RelicInstance[]
  readonly ultimate: UltimateInstance
  readonly loadCapacity: number
  readonly version: number
}
