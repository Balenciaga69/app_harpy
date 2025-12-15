/**
 * Inventory Interface
 *
 * 倉庫管理介面，負責裝備與遺物的存取、查詢、排序
 */
import type { IEquipmentInstance, IRelicInstance } from '../../../features/item'
import type { IInventoryOperationResult } from './IInventoryOperationResult'
import type { IEquipmentSlots } from './IEquipmentSlots'

export interface IInventory {
  /** 裝備槽位管理器 */
  readonly equipmentSlots: IEquipmentSlots

  /** 取得倉庫內所有裝備 */
  getAllEquipments(): IEquipmentInstance[]

  /** 取得倉庫內所有遺物 */
  getAllRelics(): IRelicInstance[]

  /** 新增裝備到倉庫 */
  addEquipment(equipment: IEquipmentInstance): IInventoryOperationResult

  /** 新增遺物到倉庫 */
  addRelic(relic: IRelicInstance): IInventoryOperationResult

  /** 從倉庫移除裝備 */
  removeEquipment(equipmentId: string): IInventoryOperationResult<IEquipmentInstance>

  /** 從倉庫移除遺物 */
  removeRelic(relicId: string, count?: number): IInventoryOperationResult<IRelicInstance>

  /** 根據 ID 查找裝備 */
  findEquipmentById(equipmentId: string): IEquipmentInstance | null

  /** 根據 ID 查找遺物 */
  findRelicById(relicId: string): IRelicInstance | null

  /** 穿戴裝備（從倉庫移到槽位） */
  equipItem(equipmentId: string): IInventoryOperationResult

  /** 卸下裝備（從槽位移到倉庫） */
  unequipItem(slot: import('../../../features/item').EquipmentSlot): IInventoryOperationResult

  /** 清空倉庫（危險操作） */
  clearInventory(): void
}
