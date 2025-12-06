import type { IEventBus } from '@/core/shared/event-bus'
import type { CombatEventMap } from '../infra/event-bus'
import type { CombatRandomGenerator } from '../infra/shared/utils/CombatRandomGenerator'
import type { IEntity } from '../infra/shared/interfaces/entity.interface'
import type { IResourceRegistry } from '../infra/resource-registry/resource-registry'
/**
 * ICombatContext
 *
 * Interface for combat context.
 * Provides read/write access to global combat resources: event bus, RNG, registry, entities, tick.
 */
export interface ICombatContext {
  readonly eventBus: IEventBus<CombatEventMap>
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
