import { ItemInstance } from '../item/models/ItemInstance'
import { EquipmentSlot } from '../item/models/ItemTemplate'
import { UnitStats } from '../stats/models/UnitStats'
import { UltimateInstance } from '../ultimate/models/UltimateInstance'

export interface CharacterInstance {
  id: string
  professionId: string
  equipment: Map<EquipmentSlot, ItemInstance>
  relics: ItemInstance[]
  ultimateSkill: UltimateInstance
}

export interface CharacterTemplate {
  id: string
  staticStats: UnitStats
}
