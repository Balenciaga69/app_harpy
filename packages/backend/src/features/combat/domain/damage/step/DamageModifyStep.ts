import type { ICombatContext } from '../../../interfaces/context/ICombatContext'
import type { DamageEvent } from '../../../interfaces/damage/DamageEvent'
import type { IDamageStep } from '../../../interfaces/damage/IDamageStep'
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
