import type { ICombatContext } from '../../../context/combat-context'
import type { ICharacter } from '../../../domain/character/models/character'
/**
 * CharacterAccessor
 *
 * Helper to retrieve characters from registry with error handling.
 * Reduces boilerplate in Effect and Ultimate implementations.
 */
export class CharacterAccessor {
  private context: ICombatContext
  constructor(context: ICombatContext) {
    this.context = context
  }
  /**
   * Get character by ID, throws error if not found
   * Use this when character must exist (internal logic)
   */
  get(id: string): ICharacter {
    const character = this.context.registry.getCharacter(id) as ICharacter | undefined
    if (!character) {
      throw new Error(`[CharacterAccessor] Character ${id} not found in registry`)
    }
    return character
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
}
