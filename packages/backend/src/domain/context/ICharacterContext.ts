import { EquipmentInstance, RelicInstance } from '../item/itemInstance'
import { EquipmentSlot } from '../item/ItemTemplate'
import { UltimateInstance } from '../ultimate/UltimateInstance'

export interface ICharacterContext {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly equipments: Partial<Record<EquipmentSlot, EquipmentInstance>>
  readonly relics: RelicInstance[]
  readonly ultimate: UltimateInstance
}
