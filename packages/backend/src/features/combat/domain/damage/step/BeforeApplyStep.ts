import type { ICombatContext } from '../../../interfaces/context/ICombatContext'
import type { DamageEvent } from '../../../interfaces/damage/DamageEvent'
import type { IDamageStep } from '../../../interfaces/damage/IDamageStep'
import { collectHooks } from './collect-hooks'
/**
 * BeforeApplyStep: Final confirmation step before damage application.
 */
export class BeforeApplyStep implements IDamageStep {
  execute(event: DamageEvent, context: ICombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.beforeDamageApply) {
        hook.beforeDamageApply(event, context)
      }
    }
    // Check if damage is prevented
    if (event.prevented) {
      this.emitPrevented(context, event)
      return false // Terminate the flow
    }
    return true // Continue processing
  }
  private emitPrevented(context: ICombatContext, event: DamageEvent): void {
    context.eventBus.emit('combat:prevented', {
      sourceId: event.source.id,
      targetId: event.target.id,
      reason: 'damage-prevented-by-effect',
      tick: event.tick,
    })
  }
}
