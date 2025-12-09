import type { EquipmentSlot } from '@/logic/item/equipment-slot'

/**
 * 物品持有者介面
 *
 * 定義角色持有裝備與遺物的能力。
 */
export interface IItemOwner {
  /**
   * 裝備物品到指定槽位
   */
  equip(slot: EquipmentSlot, itemId: string): void
  /**
   * 卸下指定槽位的裝備
   */
  unequip(slot: EquipmentSlot): void
  /**
   * 取得指定槽位的裝備
   */
  getEquipped(slot: EquipmentSlot): string | undefined
  /**
   * 取得所有已裝備的物品
   */
  getAllEquipped(): Record<EquipmentSlot, string | undefined>
}
