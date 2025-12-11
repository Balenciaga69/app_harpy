import type { CombatContext } from '@/app/combat'
import type { DamageEvent } from '../models/damage-event'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './collect-hooks'
/**
 * BeforeDamageStep: Initial step before damage calculation begins.
 */
export class BeforeDamageStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.beforeDamageCalculation) {
        hook.beforeDamageCalculation(event, context)
      }
    }
    return true // Continue processing
  }
}
