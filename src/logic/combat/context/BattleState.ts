import type { IEntity } from '../infra/shared'
import type { IBattleState } from './battle-state'
/**
 * BattleState
 *
 * Manages mutable battle state: entity collection and tick counter.
 * This class is pure domain logic with no infrastructure dependencies.
 * Designed for potential future conversion to immutable state pattern.
 */
export class BattleState implements IBattleState {
  private entities: Map<string, IEntity> = new Map()
  private currentTick: number = 0
  // === Entity Management ===
  getEntity(id: string): IEntity | undefined {
    return this.entities.get(id)
  }
  addEntity(entity: IEntity): void {
    this.entities.set(entity.id, entity)
  }
  /** Remove entity and return it (for cleanup purposes) */
  removeEntity(id: string): IEntity | undefined {
    const entity = this.entities.get(id)
    this.entities.delete(id)
    return entity
  }
  getAllEntities(): readonly IEntity[] {
    return Array.from(this.entities.values())
  }
  getEntitiesByTeam(team: IEntity['team']): readonly IEntity[] {
    return this.getAllEntities().filter((e) => e.team === team)
  }
  // === Tick Management ===
  getCurrentTick(): number {
    return this.currentTick
  }
  incrementTick(): void {
    this.currentTick++
  }
  resetTick(): void {
    this.currentTick = 0
  }
}
