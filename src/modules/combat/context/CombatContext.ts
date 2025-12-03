import { EventBus } from '../infra/event-bus'
import { CombatRandomGenerator } from '../infra/shared/utils/CombatRandomGenerator'
import type { IEntity } from '../infra/shared/interfaces/entity.interface'
import { isCharacter } from '../infra/shared/utils/TypeGuardUtil'
import type { IResourceRegistry } from '../infra/resource-registry/resource-registry'
import type { ICombatContext } from './combat-context'
import type { ICharacter } from '../domain/character/models/character'
/**
 * CombatContext
 *
 * Holds global resources for combat: event bus, RNG, resource registry, entity list, and current tick.
 * Provides read/write access for systems to share state and coordinate combat progress.
 */
export class CombatContext implements ICombatContext {
  public readonly eventBus: EventBus
  public readonly rng: CombatRandomGenerator
  public readonly registry: IResourceRegistry
  private currentTick: number = 0
  private entities: Map<string, IEntity> = new Map()
  constructor(registry: IResourceRegistry, seed?: string | number) {
    this.eventBus = new EventBus()
    this.rng = new CombatRandomGenerator(seed)
    this.registry = registry
  }
  // ===Entity===
  public getEntity(id: string): IEntity | undefined {
    return this.entities.get(id)
  }
  public addEntity(entity: IEntity): void {
    this.entities.set(entity.id, entity)
    // Auto-register character to registry for ID-based lookups
    if (isCharacter(entity)) {
      this.registry.registerCharacter(entity as ICharacter)
    }
  }
  public removeEntity(id: string): void {
    const entity = this.entities.get(id)
    if (entity && isCharacter(entity)) {
      this.registry.unregisterCharacter(id)
    }
    this.entities.delete(id)
  }
  public getAllEntities(): readonly IEntity[] {
    return Array.from(this.entities.values())
  }
  public getEntitiesByTeam(team: IEntity['team']): readonly IEntity[] {
    return this.getAllEntities().filter((e) => (e as IEntity).team === team)
  }
  // ===Tick===
  public getCurrentTick(): number {
    return this.currentTick
  }
  public incrementTick(): void {
    this.currentTick++
  }
  public resetTick(): void {
    this.currentTick = 0
  }
  // More global combat info can be added here, like RNG seed, combat settings, etc.
}
