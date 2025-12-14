/**
 * Equipment Slots Interface
 *
 * 裝備槽位管理，確保每類裝備唯一且正確穿戴/卸下
 */
import type { EquipmentSlot } from '../../../features/item'
import type { IEquipmentInstance } from '../../../features/item'

export interface IEquipmentSlots {
  /** 取得指定槽位的裝備 */
  getEquipment(slot: EquipmentSlot): IEquipmentInstance | null

  /** 取得所有已穿戴裝備 */
  getAllEquipped(): Map<EquipmentSlot, IEquipmentInstance>

  /** 穿戴裝備到指定槽位 */
  equip(equipment: IEquipmentInstance): IEquipmentInstance | null

  /** 卸下指定槽位的裝備 */
  unequip(slot: EquipmentSlot): IEquipmentInstance | null

  /** 檢查槽位是否已裝備 */
  hasEquipment(slot: EquipmentSlot): boolean

  /** 清空所有裝備槽位 */
  clearAll(): IEquipmentInstance[]
}
