import type { ICombatContext } from '../../../interfaces/context/ICombatContext'
import type { DamageEvent } from '../../../interfaces/damage/damage-event'
import type { IDamageStep } from '../../../interfaces/damage/damage-step'
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
