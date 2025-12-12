import type { ICombatContext } from '@/features/combat/context'
import type { DamageEvent } from '../../../_interfaces/damage/damage-event'
import type { IDamageStep } from '../../../_interfaces/damage/damage-step'
import { collectHooks } from './collect-hooks'
/**
 * DamageModifyStep: Step for modifying damage amount through effects.
 */
export class DamageModifyStep implements IDamageStep {
  execute(event: DamageEvent, context: ICombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.onDamageModify) {
        hook.onDamageModify(event, context)
      }
    }
    return true // Continue processing
  }
}
