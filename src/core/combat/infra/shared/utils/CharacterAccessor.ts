import type { ICombatContext } from '../../../context/combat-context'
import type { ICharacter } from '../../../domain/character/models/character'
import { Result, Failures, CombatError, type CombatFailure } from '../../errors'
/**
 * CharacterAccessor
 *
 * Helper to retrieve characters from registry with error handling.
 * Reduces boilerplate in Effect and Ultimate implementations.
 *
 * Provides both throwing and Result-based methods:
 * - get(): For internal trusted code where character must exist
 * - getResult(): For operations that may fail gracefully
 */
export class CharacterAccessor {
  private context: ICombatContext
  constructor(context: ICombatContext) {
    this.context = context
  }
  /**
   * Get character by ID, throws CombatError if not found
   * Use this when character must exist (internal logic)
   */
  get(id: string): ICharacter {
    const character = this.context.registry.getCharacter(id) as ICharacter | undefined
    if (!character) {
      throw CombatError.fromFailure(Failures.characterNotFound(id, this.context.getCurrentTick()))
    }
    return character
  }
  /**
   * Get character by ID with Result pattern
   * Use this for operations that may fail gracefully (no exception thrown)
   */
  getResult(id: string): Result<ICharacter, CombatFailure> {
    const character = this.context.registry.getCharacter(id) as ICharacter | undefined
    if (!character) {
      return Result.fail(Failures.characterNotFound(id, this.context.getCurrentTick()))
    }
    return Result.ok(character)
  }
  /**
   * Try to get character by ID, returns undefined if not found
   * Use this when character might not exist (edge cases)
   */
  tryGet(id: string): ICharacter | undefined {
    return this.context.registry.getCharacter(id) as ICharacter | undefined
  }
  /**
   * Check if character exists in registry
   */
  has(id: string): boolean {
    return this.context.registry.hasCharacter(id)
  }
  /**
   * Get character if alive, returns failure if dead or not found
   */
  getAlive(id: string): Result<ICharacter, CombatFailure> {
    const result = this.getResult(id)
    if (result.isFail()) {
      return result
    }
    if (result.value.isDead) {
      return Result.fail(Failures.characterDead(id, this.context.getCurrentTick()))
    }
    return result
  }
}
