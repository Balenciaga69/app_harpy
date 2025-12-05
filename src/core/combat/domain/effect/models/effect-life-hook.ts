import type { ICombatContext } from '@/core/combat/context'
/**
 * Effect Life Hook
 *
 * Defines lifecycle events for effects attached to characters.
 * Separate from combat hooks to maintain clear separation of concerns.
 */
export interface IEffectLifeHook {
  /**
   * Called when effect is applied to character
   * Use for initialization (e.g., apply attribute modifiers)
   */
  onApply?(characterId: string, context: ICombatContext): void
  /**
   * Called when effect is removed from character
   * Use for cleanup (e.g., remove attribute modifiers)
   */
  onRemove?(characterId: string, context: ICombatContext): void
  /**
   * Called every combat tick while effect is active
   * Use for periodic effects (e.g., poison damage, stack decay)
   */
  onTick?(characterId: string, context: ICombatContext): void
}
