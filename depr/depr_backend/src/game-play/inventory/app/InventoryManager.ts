/**
 * Inventory Manager
 *
 * 倉庫管理器，負責裝備與遺物的存取、查詢、排序與事件發射
 */
import type { IInventory } from '../interfaces/IInventory'
import type { IEquipmentSlots } from '../interfaces/IEquipmentSlots'
import type { IInventoryOperationResult } from '../interfaces/IInventoryOperationResult'
import type { IEquipmentInstance, IRelicInstance, EquipmentSlot } from '../../../features/item'
import type { IEventBus } from '../../../shared/event-bus'
import type { IInventoryEvents } from '../interfaces/IInventoryEvents'
import { EquipmentSlots } from './EquipmentSlots'
import { INVENTORY_MESSAGES } from '../domain/InventoryConstants'

export class InventoryManager implements IInventory {
  private readonly equipments: Map<string, IEquipmentInstance>
  private readonly relics: Map<string, IRelicInstance>
  public readonly equipmentSlots: IEquipmentSlots
  private readonly eventBus: IEventBus<IInventoryEvents>

  constructor(eventBus: IEventBus<IInventoryEvents>) {
    this.equipments = new Map()
    this.relics = new Map()
    this.equipmentSlots = new EquipmentSlots()
    this.eventBus = eventBus
  }

  /** 取得倉庫內所有裝備 */
  getAllEquipments(): IEquipmentInstance[] {
    return Array.from(this.equipments.values())
  }

  /** 取得倉庫內所有遺物 */
  getAllRelics(): IRelicInstance[] {
    return Array.from(this.relics.values())
  }

  /** 新增裝備到倉庫 */
  addEquipment(equipment: IEquipmentInstance): IInventoryOperationResult {
    if (this.equipments.has(equipment.id)) {
      return {
        success: false,
        error: `Equipment already exists: ${equipment.id}`,
      }
    }

    this.equipments.set(equipment.id, equipment)
    this.eventBus.emit('inventory:equipment:added', { equipment })

    return {
      success: true,
      data: undefined,
    }
  }

  /** 新增遺物到倉庫 */
  addRelic(relic: IRelicInstance): IInventoryOperationResult {
    if (this.relics.has(relic.id)) {
      return {
        success: false,
        error: `Relic already exists: ${relic.id}`,
      }
    }

    this.relics.set(relic.id, relic)
    this.eventBus.emit('inventory:relic:added', { relic })

    return {
      success: true,
      data: undefined,
    }
  }

  /** 從倉庫移除裝備 */
  removeEquipment(equipmentId: string): IInventoryOperationResult<IEquipmentInstance> {
    const equipment = this.equipments.get(equipmentId)
    if (!equipment) {
      return {
        success: false,
        error: INVENTORY_MESSAGES.ITEM_NOT_FOUND,
      }
    }

    this.equipments.delete(equipmentId)
    this.eventBus.emit('inventory:equipment:removed', { equipmentId })

    return {
      success: true,
      data: equipment,
    }
  }

  /** 從倉庫移除遺物 */
  removeRelic(relicId: string, count: number = 1): IInventoryOperationResult<IRelicInstance> {
    const relic = this.relics.get(relicId)
    if (!relic) {
      return {
        success: false,
        error: INVENTORY_MESSAGES.ITEM_NOT_FOUND,
      }
    }

    if (count >= relic.stackCount) {
      this.relics.delete(relicId)
    } else {
      const updatedRelic: IRelicInstance = {
        ...relic,
        stackCount: relic.stackCount - count,
      }
      this.relics.set(relicId, updatedRelic)
    }

    this.eventBus.emit('inventory:relic:removed', { relicId, count })

    return {
      success: true,
      data: relic,
    }
  }

  /** 根據 ID 查找裝備 */
  findEquipmentById(equipmentId: string): IEquipmentInstance | null {
    return this.equipments.get(equipmentId) ?? null
  }

  /** 根據 ID 查找遺物 */
  findRelicById(relicId: string): IRelicInstance | null {
    return this.relics.get(relicId) ?? null
  }

  /** 穿戴裝備（從倉庫移到槽位） */
  equipItem(equipmentId: string): IInventoryOperationResult {
    const equipment = this.equipments.get(equipmentId)
    if (!equipment) {
      return {
        success: false,
        error: INVENTORY_MESSAGES.ITEM_NOT_FOUND,
      }
    }

    const previousEquipment = this.equipmentSlots.equip(equipment)
    this.equipments.delete(equipmentId)

    if (previousEquipment) {
      this.equipments.set(previousEquipment.id, previousEquipment)
    }

    this.eventBus.emit('inventory:equipment:equipped', {
      equipment,
      slot: equipment.slot,
    })
    this.eventBus.emit('inventory:slots:changed', { timestamp: Date.now() })

    return {
      success: true,
      data: undefined,
    }
  }

  /** 卸下裝備（從槽位移到倉庫） */
  unequipItem(slot: EquipmentSlot): IInventoryOperationResult {
    const equipment = this.equipmentSlots.unequip(slot)
    if (!equipment) {
      return {
        success: false,
        error: INVENTORY_MESSAGES.SLOT_EMPTY,
      }
    }

    this.equipments.set(equipment.id, equipment)

    this.eventBus.emit('inventory:equipment:unequipped', {
      equipment,
      slot,
    })
    this.eventBus.emit('inventory:slots:changed', { timestamp: Date.now() })

    return {
      success: true,
      data: undefined,
    }
  }

  /** 清空倉庫（危險操作） */
  clearInventory(): void {
    this.equipments.clear()
    this.relics.clear()
  }
}
