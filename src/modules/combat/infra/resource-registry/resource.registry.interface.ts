import type { IEffect } from '../../domain/effect/models/effect.model'
import type { Equipment } from '../../domain/item/models/equipment.model'
import type { Relic } from '../../domain/item/models/relic.model'
import type { IUltimateAbility } from '../../domain/ultimate'
/**
 * Resource Registry Interface
 *
 * Central catalog for tracking and looking up game resources.
 * The registry only provides global lookup capability.
 *
 * Use cases:
 * - Cross-system resource queries (e.g., debugging, analytics)
 * - Avoiding duplicate registration
 * - Centralized resource lifecycle tracking
 */
export interface IResourceRegistry {
  // === Effect Tracking ===
  // Effects are owned by Characters, registry only tracks for global queries
  registerEffect(effect: IEffect): void
  unregisterEffect(id: string): void
  getEffect(id: string): IEffect | undefined
  hasEffect(id: string): boolean
  // === Ultimate Catalog ===
  // Ultimates are typically stateless and can be shared
  registerUltimate(ultimate: IUltimateAbility): void
  getUltimate(id: string): IUltimateAbility | undefined
  hasUltimate(id: string): boolean
  // === Equipment Catalog ===
  // Equipment instances, registered when created
  registerEquipment(equipment: Equipment): void
  getEquipment(id: string): Equipment | undefined
  hasEquipment(id: string): boolean
  // === Relic Catalog ===
  // Relic instances, registered when created
  registerRelic(relic: Relic): void
  getRelic(id: string): Relic | undefined
  hasRelic(id: string): boolean
  // === Lifecycle ===
  /** Clear all registered resources (typically called after combat ends) */
  clear(): void
}
