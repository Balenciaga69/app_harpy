import type { IEntity } from '../infra/shared/interfaces/entity.interface'

/**
 * IBattleState
 *
 * Interface for battle state management.
 * Handles entity collection and tick counter - the mutable game state.
 * Separated from CombatContext to follow Single Responsibility Principle.
 */
export interface IBattleState {
  // === Entity Management ===
  getEntity(id: string): IEntity | undefined
  addEntity(entity: IEntity): void
  removeEntity(id: string): IEntity | undefined
  getAllEntities(): readonly IEntity[]
  getEntitiesByTeam(team: IEntity['team']): readonly IEntity[]

  // === Tick Management ===
  getCurrentTick(): number
  incrementTick(): void
  resetTick(): void
}
