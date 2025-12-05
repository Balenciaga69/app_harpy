import type { IEffect } from '../../domain/effect/models/effect'
import type { Equipment } from '../../domain/item/models/equipment'
import type { Relic } from '../../domain/item/models/relic'
import type { IUltimateAbility } from '../../domain/ultimate'
import type { ICharacter } from '../../domain/character/models/character'
import type { IResourceRegistry } from './resource-registry'
/**
 * In-Memory Resource Registry
 *
 * Simple Map-based implementation for single-player combat.
 */
export class InMemoryResourceRegistry implements IResourceRegistry {
  private characters = new Map<string, ICharacter>()
  private effects = new Map<string, IEffect>()
  private ultimates = new Map<string, IUltimateAbility>()
  private equipment = new Map<string, Equipment>()
  private relics = new Map<string, Relic>()
  // === Character Catalog ===
  registerCharacter(character: ICharacter): void {
    this.characters.set(character.id, character)
  }
  unregisterCharacter(id: string): void {
    this.characters.delete(id)
  }
  getCharacter(id: string): ICharacter | undefined {
    return this.characters.get(id)
  }
  hasCharacter(id: string): boolean {
    return this.characters.has(id)
  }
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
    this.characters.clear()
    this.effects.clear()
    this.ultimates.clear()
    this.equipment.clear()
    this.relics.clear()
  }
}
