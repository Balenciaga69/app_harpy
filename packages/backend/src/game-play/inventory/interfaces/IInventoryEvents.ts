/**
 * Inventory Events
 *
 * 庫存模組事件定義，供 EventBus 使用
 */
import type { IEquipmentInstance, IRelicInstance } from '../../../features/item'
import type { EquipmentSlot } from '../../../features/item'

export type IInventoryEvents = {
  /** 裝備被新增到倉庫 */
  'inventory:equipment:added': { equipment: IEquipmentInstance }

  /** 遺物被新增到倉庫 */
  'inventory:relic:added': { relic: IRelicInstance }

  /** 裝備從倉庫移除 */
  'inventory:equipment:removed': { equipmentId: string }

  /** 遺物從倉庫移除 */
  'inventory:relic:removed': { relicId: string; count: number }

  /** 裝備被穿戴 */
  'inventory:equipment:equipped': { equipment: IEquipmentInstance; slot: EquipmentSlot }

  /** 裝備被卸下 */
  'inventory:equipment:unequipped': { equipment: IEquipmentInstance; slot: EquipmentSlot }

  /** 裝備槽位狀態改變（需要重新計算屬性） */
  'inventory:slots:changed': { timestamp: number }
}
