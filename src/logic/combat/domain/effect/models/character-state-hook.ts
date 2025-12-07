import type { ICombatContext } from '@/logic/combat/context'
/**
 * Character State Hook
 *
 * Defines hooks for character state changes.
 * Effects can optionally implement these to react to revival, HP reaching zero, etc.
 */
export interface ICharacterStateHook {
  /**
   * Called when character revives after HP reached zero
   * Use for effects that trigger on revival (e.g., gain buff after revival)
   */
  onRevive?(characterId: string, context: ICombatContext): void
  /**
   * Called when character's HP reaches zero (before death/resurrection check)
   * Use for death-triggered effects (e.g., explode on death dealing true damage)
   * Note: This is called BEFORE resurrection check, so character may still revive
   */
  onHpZero?(characterId: string, context: ICombatContext): void
}
