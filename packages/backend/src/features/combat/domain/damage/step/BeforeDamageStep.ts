import type { ICombatContext } from '../../../interfaces/context/ICombatContext'
import type { DamageEvent } from '../../../interfaces/damage/DamageEvent'
import type { IDamageStep } from '../../../interfaces/damage/IDamageStep'
import { collectHooks } from './CollectHooks'
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
