import type { IEffect } from '../../domain/effect/models/effect.model'
import type { Equipment } from '../../domain/item/models/equipment.model'
import type { Relic } from '../../domain/item/models/relic.model'
import type { IUltimateAbility } from '../../domain/ultimate'
import type { IResourceRegistry } from './resource.registry.interface'

/**
 * In-Memory Resource Registry
 *
 * Simple Map-based implementation for single-player combat.
 * All lookups are O(1) with minimal overhead.
 *
 * Lifecycle:
 * - Created once per combat session
 * - Cleared after combat ends
 * - Resources registered during combat setup
 */
export class InMemoryResourceRegistry implements IResourceRegistry {
  private effects = new Map<string, IEffect>()
  private ultimates = new Map<string, IUltimateAbility>()
  private equipment = new Map<string, Equipment>()
  private relics = new Map<string, Relic>()

  // === Effect Tracking ===
  registerEffect(effect: IEffect): void {
    this.effects.set(effect.id, effect)
  }

  unregisterEffect(id: string): void {
    this.effects.delete(id)
  }

  getEffect(id: string): IEffect | undefined {
    return this.effects.get(id)
  }

  hasEffect(id: string): boolean {
    return this.effects.has(id)
  }

  // === Ultimate Catalog ===
  registerUltimate(ultimate: IUltimateAbility): void {
    this.ultimates.set(ultimate.id, ultimate)
  }

  getUltimate(id: string): IUltimateAbility | undefined {
    return this.ultimates.get(id)
  }

  hasUltimate(id: string): boolean {
    return this.ultimates.has(id)
  }

  // === Equipment Catalog ===
  registerEquipment(equipment: Equipment): void {
    this.equipment.set(equipment.id, equipment)
  }

  getEquipment(id: string): Equipment | undefined {
    return this.equipment.get(id)
  }

  hasEquipment(id: string): boolean {
    return this.equipment.has(id)
  }

  // === Relic Catalog ===
  registerRelic(relic: Relic): void {
    this.relics.set(relic.id, relic)
  }

  getRelic(id: string): Relic | undefined {
    return this.relics.get(id)
  }

  hasRelic(id: string): boolean {
    return this.relics.has(id)
  }

  // === Lifecycle ===
  clear(): void {
    this.effects.clear()
    this.ultimates.clear()
    this.equipment.clear()
    this.relics.clear()
  }
}
