import type { ICombatContext } from '@/modules/combat/context'
/**
 * Ultimate interface - behavior contract
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
  /** Execute ultimate */
  execute(casterId: string, context: ICombatContext): void
}
