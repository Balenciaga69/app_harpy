import type { DamageEvent } from '../../../interfaces/damage/DamageEvent'
import type { ICombatContext } from '../../../interfaces/context/ICombatContext'
import { type IDamageStep } from '@/features/combat/interfaces/damage/IDamageStep'
import { collectHooks } from './CollectHooks'
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
