// TODO: [Cross-layer dependency] Coordination layer depends on Domain layer's ICharacter and Context layer's CombatContext
// Reason: Ultimate execution needs:
//   1. Access to caster (ICharacter)'s attributes and methods
//   2. Access to combat context (CombatContext) to affect other characters or query status
// Migration note: If migrating to strongly typed language, suggest elevating these two interfaces to shared contract layer
import type { ICharacter } from '../../../domain/character/interfaces/character.interface'
import type { CombatContext } from '@/modules/combat/context'
/**
 * Ultimate interface - behavior contract
 *
 * Defines abilities that ultimate should have, uses strategy pattern for implementation
 *
 * Design concept:
 * - Ultimate is not necessarily damage skill, can be support, summon, heal, etc.
 * - Uses strategy pattern, each character can have different ultimate implementation
 * - Energy is already cleared when ultimate executes, can focus on skill logic
 */
export interface IUltimateAbility {
  /** Ultimate unique identifier */
  readonly id: string
  /** Ultimate name */
  readonly name: string
  /** Ultimate description */
  readonly description: string
  /** Ultimate type tag (for UI display or categorization) */
  readonly type: UltimateType
  /**
   * Execute ultimate
   * @param caster The caster
   * @param context Combat context
   */
  execute(caster: ICharacter, context: CombatContext): void
}
/** Ultimate types */
export type UltimateType =
  | 'damage' // Damage type
  | 'buff' // Buff type
  | 'heal' // Heal type
  | 'summon' // Summon type
  | 'control' // Control type
  | 'hybrid' // Hybrid type
