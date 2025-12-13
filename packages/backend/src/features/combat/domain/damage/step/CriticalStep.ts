import type { ICombatContext } from '../../../interfaces/context/ICombatContext'
import type { DamageEvent } from '../../../interfaces/damage/DamageEvent'
import type { IDamageStep } from '../../../interfaces/damage/IDamageStep'
import { collectHooks } from './CollectHooks'
import { CriticalFormula } from '../../config/FormulaConstants'
/**
 * CriticalStep: Determines if damage is critical and applies critical multiplier.
 */
export class CriticalStep implements IDamageStep {
  execute(event: DamageEvent, context: ICombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // Execute hooks
    for (const hook of hooks) {
      if (hook.onCritCheck) {
        hook.onCritCheck(event, context)
      }
    }
    // Calculate critical chance
    const critChance = event.source.getAttribute('criticalChance') ?? 0
    event.isCrit = context.rng.next() < critChance
    // If critical, apply critical multiplier
    if (event.isCrit) {
      const critMultiplier = event.source.getAttribute('criticalMultiplier') ?? CriticalFormula.DEFAULT_MULTIPLIER
      event.amount *= critMultiplier
      this.emitCriticalEvent(context, event, critMultiplier)
    }
    return true
  }
  private emitCriticalEvent(context: ICombatContext, event: DamageEvent, critMultiplier: number): void {
    context.eventBus.emit('entity:critical', {
      sourceId: event.source.id,
      targetId: event.target.id,
      multiplier: critMultiplier,
      tick: event.tick,
    })
  }
}
