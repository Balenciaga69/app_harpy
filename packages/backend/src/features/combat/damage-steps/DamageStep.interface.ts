import type { ICombatContext } from '@/features/combat/context'
import type { DamageEvent } from '../damage/models/damage-event'
/**
 * DamageStep interface
 *
 * Define unified interface for each step in damage calculation process
 */
export interface IDamageStep {
  /**
   * Execute this step's logic
   * @returns Whether to continue to next step (false = terminate process)
   */
  execute(event: DamageEvent, context: ICombatContext): boolean
}
