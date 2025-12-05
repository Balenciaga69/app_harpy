import type { CombatContext } from '@/core/combat/context'
import type { DamageEvent } from '../models/damage-event'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './collect-hooks'
/**
 * DamageModifyStep: Step for modifying damage amount through effects.
 */
export class DamageModifyStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.onDamageModify) {
        hook.onDamageModify(event, context)
      }
    }
    return true // Continue processing
  }
}
