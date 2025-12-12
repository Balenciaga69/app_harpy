import type { ICombatContext } from '@/features/combat/context'
import type { DamageEvent } from '../../../_interfaces/damage/damage-event'
import type { IDamageStep } from '../../../_interfaces/damage/damage-step'
import { collectHooks } from './collect-hooks'
/**
 * AfterApplyStep: Post-damage application step for cleanup and effects.
 */
export class AfterApplyStep implements IDamageStep {
  execute(event: DamageEvent, context: ICombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.afterDamageApply) {
        hook.afterDamageApply(event, context)
      }
    }
    return true // Continue execution
  }
}
