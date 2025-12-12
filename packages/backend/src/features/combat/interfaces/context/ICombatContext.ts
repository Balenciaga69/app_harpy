import { ICombatEventBus } from '../event-bus/ICombatEventBus'
import { ICombatRandomGenerator } from '../shared/ICombatRandomGenerator'
import type { IEntity } from '../shared/IEntity'
import type { IResourceRegistry } from '../resource-registry/IResourceRegistry'
/**
 * ICombatContext
 *
 * Interface for combat context.
 * Provides read/write access to global combat resources: event bus, RNG, registry, entities, tick.
 */
export interface ICombatContext {
  readonly eventBus: ICombatEventBus
  readonly rng: ICombatRandomGenerator
  readonly registry: IResourceRegistry
  // Entity management
  getEntity(id: string): IEntity | undefined
  addEntity(entity: IEntity): void
  removeEntity(id: string): void
  getAllEntities(): readonly IEntity[]
  getEntitiesByTeam(team: IEntity['team']): readonly IEntity[]
  // Tick management
  getCurrentTick(): number
  incrementTick(): void
  resetTick(): void
}
