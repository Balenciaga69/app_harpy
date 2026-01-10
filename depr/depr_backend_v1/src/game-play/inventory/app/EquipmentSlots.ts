/**
 * Equipment Slots Manager
 *
 * 裝備槽位管理器，確保每類裝備唯一且正確穿戴/卸下
 */
import type { IEquipmentSlots } from '../interfaces/IEquipmentSlots'
import type { IEquipmentInstance } from '../../../features/item'
import type { EquipmentSlot } from '../../../features/item'

export class EquipmentSlots implements IEquipmentSlots {
  private readonly slots: Map<EquipmentSlot, IEquipmentInstance>

  constructor() {
    this.slots = new Map()
  }

  /** 取得指定槽位的裝備 */
  getEquipment(slot: EquipmentSlot): IEquipmentInstance | null {
    return this.slots.get(slot) ?? null
  }

  /** 取得所有已穿戴裝備 */
  getAllEquipped(): Map<EquipmentSlot, IEquipmentInstance> {
    return new Map(this.slots)
  }

  /** 穿戴裝備到指定槽位 */
  equip(equipment: IEquipmentInstance): IEquipmentInstance | null {
    const previousEquipment = this.slots.get(equipment.slot) ?? null
    this.slots.set(equipment.slot, equipment)
    return previousEquipment
  }

  /** 卸下指定槽位的裝備 */
  unequip(slot: EquipmentSlot): IEquipmentInstance | null {
    const equipment = this.slots.get(slot) ?? null
    if (equipment) {
      this.slots.delete(slot)
    }
    return equipment
  }

  /** 檢查槽位是否已裝備 */
  hasEquipment(slot: EquipmentSlot): boolean {
    return this.slots.has(slot)
  }

  /** 清空所有裝備槽位 */
  clearAll(): IEquipmentInstance[] {
    const allEquipments = Array.from(this.slots.values())
    this.slots.clear()
    return allEquipments
  }
}
