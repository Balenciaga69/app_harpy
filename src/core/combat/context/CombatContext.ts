import type { ICombatEventBus } from '../infra/event-bus'
import { CombatRandomGenerator } from '../infra/shared/utils/CombatRandomGenerator'
import type { IEntity } from '../infra/shared/interfaces/entity.interface'
import { isCharacter } from '../infra/shared/utils/TypeGuardUtil'
import type { IResourceRegistry } from '../infra/resource-registry/resource-registry'
import type { ICombatContext } from './combat-context'
import type { ICharacter } from '../domain/character/models/character'
import { BattleState } from './BattleState'
/**
 * CombatContext
 *
 * Global resource container for combat infrastructure.
 * Composes BattleState for entity/tick management, separating concerns:
 * - CombatContext: infrastructure (eventBus, rng, registry)
 * - BattleState: domain state (entities, tick)
 *
 * Delegates entity/tick operations to BattleState while handling
 * registry synchronization for character lookups.
 */
export class CombatContext implements ICombatContext {
  public readonly eventBus: ICombatEventBus
  public readonly rng: CombatRandomGenerator
  public readonly registry: IResourceRegistry
  private readonly battleState: BattleState
  constructor(eventBus: ICombatEventBus, registry: IResourceRegistry, seed?: string | number) {
    this.eventBus = eventBus
    this.rng = new CombatRandomGenerator(seed)
    this.registry = registry
    this.battleState = new BattleState()
  }
  // === Entity ===
  public getEntity(id: string): IEntity | undefined {
    return this.battleState.getEntity(id)
  }
  public addEntity(entity: IEntity): void {
    this.battleState.addEntity(entity)
    // Sync character to registry for ID-based lookups
    if (isCharacter(entity)) {
      this.registry.registerCharacter(entity as ICharacter)
    }
  }
  public removeEntity(id: string): void {
    const entity = this.battleState.removeEntity(id)
    // Sync removal from registry
    if (entity && isCharacter(entity)) {
      this.registry.unregisterCharacter(id)
    }
  }
  public getAllEntities(): readonly IEntity[] {
    return this.battleState.getAllEntities()
  }
  public getEntitiesByTeam(team: IEntity['team']): readonly IEntity[] {
    return this.battleState.getEntitiesByTeam(team)
  }
  // === Tick ===
  public getCurrentTick(): number {
    return this.battleState.getCurrentTick()
  }
  public incrementTick(): void {
    this.battleState.incrementTick()
  }
  public resetTick(): void {
    this.battleState.resetTick()
  }
}
