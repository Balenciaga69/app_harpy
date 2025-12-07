import type { ICharacter } from '../character/models/character'
import type { ICombatContext } from '@/logic/combat/context'
import type { ICombatEquipment } from './models/combat-item'
import type { EquipmentSlot } from '@/domain/item'
/**
 * EquipmentManager
 *
 * 管理角色的裝備槽位。
 * 每個槽位只能持有一件裝備，裝備時自動應用效果。
 */
export class EquipmentManager {
  private readonly slots = new Map<EquipmentSlot, ICombatEquipment>()
  private readonly owner: ICharacter
  constructor(owner: ICharacter) {
    this.owner = owner
  }
  /** 裝備到指定槽位，自動卸下舊裝備 */
  equip(equipment: ICombatEquipment, context: ICombatContext): void {
    const oldEquipment = this.slots.get(equipment.slot)
    if (oldEquipment) {
      this.unequip(equipment.slot, context)
    }
    this.slots.set(equipment.slot, equipment)
    for (const effect of equipment.effects) {
      this.owner.addEffect(effect, context)
    }
  }
  /** 卸下指定槽位的裝備 */
  unequip(slot: EquipmentSlot, context: ICombatContext): void {
    const equipment = this.slots.get(slot)
    if (!equipment) return
    for (const effect of equipment.effects) {
      this.owner.removeEffect(effect.id, context)
    }
    this.slots.delete(slot)
  }
  /** 取得指定槽位的裝備 */
  getEquipment(slot: EquipmentSlot): ICombatEquipment | undefined {
    return this.slots.get(slot)
  }
  /** 取得所有已裝備的物品 */
  getAllEquipment(): ICombatEquipment[] {
    return Array.from(this.slots.values())
  }
  /** 檢查槽位是否為空 */
  isSlotEmpty(slot: EquipmentSlot): boolean {
    return !this.slots.has(slot)
  }
  /** 清除所有裝備 */
  clear(context: ICombatContext): void {
    const slotsToUnequip = Array.from(this.slots.keys())
    for (const slot of slotsToUnequip) {
      this.unequip(slot, context)
    }
  }
}
