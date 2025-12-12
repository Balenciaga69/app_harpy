import type { IEffect } from '@/features/effect-system/models/effect'
import type { IUltimateAbility } from '../ultimate'
import type { ICharacter } from '../character/models/character'
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
  // === Lifecycle ===
  clear(): void {
    this.characters.clear()
    this.effects.clear()
    this.ultimates.clear()
  }
}
