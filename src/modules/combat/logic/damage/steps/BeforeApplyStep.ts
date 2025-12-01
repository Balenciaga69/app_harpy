import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models/damage.event.model'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * BeforeApplyStep: Final confirmation step before damage application.
 */
export class BeforeApplyStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.beforeDamageApply) {
        hook.beforeDamageApply(event, context)
      }
    }
    // Check if damage is prevented
    if (event.prevented) {
      context.eventBus.emit('combat:prevented', {
        sourceId: event.source.id,
        targetId: event.target.id,
        reason: 'damage-prevented-by-effect',
        tick: event.tick,
      })
      return false // Terminate the flow
    }
    return true // Continue processing
  }
}
