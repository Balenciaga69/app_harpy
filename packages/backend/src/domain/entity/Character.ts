import { ItemInstance } from '../item/itemInstance'
import { EquipmentSlot } from '../item/ItemTemplate'
import { UnitStats } from '../stats/models/UnitStats'
import { UltimateInstance } from '../ultimate/UltimateInstance'

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
