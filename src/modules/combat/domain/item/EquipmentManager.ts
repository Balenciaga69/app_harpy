import type { ICharacter } from '../character/models/character'
import type { ICombatContext } from '@/modules/combat/context'
import type { Equipment } from './models/equipment'
import type { IEffect } from '../effect/models/effect'
import type { EquipmentSlot } from './models'
/**
 * EquipmentManager
 *
 * Manages multiple equipment slots for a character.
 * Each slot can only hold one equipment at a time.
 * Applies/removes equipment effects when equipping/unequipping.
 */
export class EquipmentManager {
  private slots: Map<EquipmentSlot, string> = new Map() // slot -> equipmentId
  private readonly owner: ICharacter
  private readonly getRegistry: () => ICombatContext['registry']
  constructor(owner: ICharacter, getRegistry: () => ICombatContext['registry']) {
    this.owner = owner
    this.getRegistry = getRegistry
  }
  /**
   * Equip an equipment to specified slot
   * Automatically unequips old equipment in that slot if exists
   */
  equip(equipment: Equipment, slot: EquipmentSlot, context: ICombatContext): void {
    // Unequip old equipment in this slot if exists
    const oldEquipmentId = this.slots.get(slot)
    if (oldEquipmentId) {
      this.unequip(slot, context)
    }
    // Register to registry
    context.registry.registerEquipment(equipment)
    this.slots.set(slot, equipment.id)
    // Apply all effects from this equipment
    equipment.getEffects().forEach((effect: IEffect) => {
      this.owner.addEffect(effect, context)
    })
  }
  /**
   * Unequip equipment from specified slot
   */
  unequip(slot: EquipmentSlot, context: ICombatContext): void {
    const equipmentId = this.slots.get(slot)
    if (!equipmentId) return
    const equipment = context.registry.getEquipment(equipmentId) as Equipment | undefined
    if (!equipment) return
    // Remove all effects from this equipment
    equipment.getEffects().forEach((effect) => {
      this.owner.removeEffect(effect.id, context)
    })
    this.slots.delete(slot)
  }
  /**
   * Get equipment in specified slot
   */
  getEquipment(slot: EquipmentSlot): Equipment | undefined {
    const equipmentId = this.slots.get(slot)
    if (!equipmentId) return undefined
    return this.getRegistry().getEquipment(equipmentId) as Equipment | undefined
  }
  /**
   * Get all equipped items
   */
  getAllEquipment(): Equipment[] {
    const equipment: Equipment[] = []
    this.slots.forEach((equipmentId) => {
      const eq = this.getRegistry().getEquipment(equipmentId) as Equipment | undefined
      if (eq) equipment.push(eq)
    })
    return equipment
  }
  /**
   * Check if slot is empty
   */
  isSlotEmpty(slot: EquipmentSlot): boolean {
    return !this.slots.has(slot)
  }
  /**
   * Clear all equipment
   */
  clear(context: ICombatContext): void {
    const slotsToUnequip = Array.from(this.slots.keys())
    slotsToUnequip.forEach((slot) => {
      this.unequip(slot, context)
    })
  }
}
