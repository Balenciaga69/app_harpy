import type { ICombatContext } from '@/features/combat/context'
import type { DamageEvent } from '../../../interfaces/damage/damage-event'
import type { IDamageStep } from '../../../interfaces/damage/damage-step'
import { collectHooks } from './collect-hooks'
/**
 * BeforeDamageStep: Initial step before damage calculation begins.
 */
export class BeforeDamageStep implements IDamageStep {
  execute(event: DamageEvent, context: ICombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.beforeDamageCalculation) {
        hook.beforeDamageCalculation(event, context)
      }
    }
    return true // Continue processing
  }
}
