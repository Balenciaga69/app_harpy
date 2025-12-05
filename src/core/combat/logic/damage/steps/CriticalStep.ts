import type { CombatContext } from '@/core/combat'
import type { DamageEvent } from '../models/damage-event'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './collect-hooks'
import { CriticalFormula } from '@/core/combat/infra/config'
/**
 * CriticalStep: Determines if damage is critical and applies critical multiplier.
 */
export class CriticalStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
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
      // Emit critical event
      context.eventBus.emit('entity:critical', {
        sourceId: event.source.id,
        targetId: event.target.id,
        multiplier: critMultiplier,
        tick: event.tick,
      })
    }
    return true
  }
}
