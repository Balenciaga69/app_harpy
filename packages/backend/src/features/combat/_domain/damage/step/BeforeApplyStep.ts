import type { ICombatContext } from '@/features/combat/context'
import type { DamageEvent } from '../../../_interfaces/damage/damage-event'
import type { IDamageStep } from '../../../_interfaces/damage/damage-step'
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
  private emitPrevented(context: CombatContext, event: DamageEvent): void {
    context.eventBus.emit('combat:prevented', {
      sourceId: event.source.id,
      targetId: event.target.id,
      reason: 'damage-prevented-by-effect',
      tick: event.tick,
    })
  }
}
