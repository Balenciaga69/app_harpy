import type { Equipment } from '../../item/models/equipment'
import type { Relic } from '../../item/models/relic'
import type { EquipmentSlot } from '../../item/models/equipment-slot'
import type { ICombatContext } from '@/modules/combat/context'
/**
 * Item Owner interface
 *
 * Defines ability to own and manage equipment and relics
 */
export interface IItemOwner {
  // === Equipment Management ===
  equipItem(equipment: Equipment, slot: EquipmentSlot, context: ICombatContext): void
  unequipItem(slot: EquipmentSlot, context: ICombatContext): void
  getEquipment(slot: EquipmentSlot): Equipment | undefined
  getAllEquipment(): Equipment[]
  // === Relic Management ===
  addRelic(relic: Relic, context: ICombatContext): void
  removeRelic(relicId: string, context: ICombatContext): void
  getRelic(relicId: string): Relic | undefined
  getAllRelics(): readonly Relic[]
}
