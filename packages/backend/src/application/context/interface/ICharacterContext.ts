import { EquipmentInstance, RelicInstance } from '../../../domain/item/itemInstance'
import { EquipmentSlot } from '../../../domain/item/ItemTemplate'
import { UltimateInstance } from '../../../domain/ultimate/UltimateInstance'

export interface ICharacterContext {
  readonly id: string
  readonly name: string
  readonly professionId: string
  readonly equipments: Partial<Record<EquipmentSlot, EquipmentInstance>>
  readonly relics: RelicInstance[]
  readonly ultimate: UltimateInstance
}
