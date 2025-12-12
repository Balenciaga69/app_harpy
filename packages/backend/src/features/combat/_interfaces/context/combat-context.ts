import type { ICombatEventBus } from '../event-bus'
import type { CombatRandomGenerator } from '../shared/utils/CombatRandomGenerator'
import type { IEntity } from '../shared/interfaces/entity.interface'
import type { IResourceRegistry } from '../resource-registry/resource-registry'
/**
 * ICombatContext
 *
 * Interface for combat context.
 * Provides read/write access to global combat resources: event bus, RNG, registry, entities, tick.
 */
export interface ICombatContext {
  readonly eventBus: ICombatEventBus
  readonly rng: CombatRandomGenerator
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
