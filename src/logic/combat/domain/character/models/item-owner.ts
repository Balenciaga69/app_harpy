import type { ICombatEquipment, ICombatRelic } from '../../item/models/combat-item'
import type { EquipmentSlot } from '@/domain/item'
import type { ICombatContext } from '@/logic/combat/context'
/**
 * Item Owner interface
 *
 * 定義角色管理裝備與遺物的能力。
 * 使用 ICombatEquipment/ICombatRelic 而非完整的 Equipment/Relic。
 */
export interface IItemOwner {
  // === Equipment Management ===
  equipItem(equipment: ICombatEquipment, context: ICombatContext): void
  unequipItem(slot: EquipmentSlot, context: ICombatContext): void
  getEquipment(slot: EquipmentSlot): ICombatEquipment | undefined
  getAllEquipment(): ICombatEquipment[]
  // === Relic Management ===
  addRelic(relic: ICombatRelic, context: ICombatContext): void
  removeRelic(relicName: string, context: ICombatContext): void
  getRelic(relicName: string): ICombatRelic | undefined
  getAllRelics(): readonly ICombatRelic[]
}
