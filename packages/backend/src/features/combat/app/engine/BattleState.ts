import { IBattleState } from '../../interfaces/context/IBattleState'
import { IEntity } from '../../interfaces/shared/IEntity'
/**
 * BattleState
 *
 * 管理可變戰鬥狀態：Entity + Ticker
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
