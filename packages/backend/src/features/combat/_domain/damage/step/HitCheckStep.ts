import type { ICombatContext } from '@/features/combat/context'
import type { DamageEvent } from '../../../_interfaces/damage/damage-event'
import { calculateHitChance } from '../../DamageCalculator'
import type { IDamageStep } from '../../../_interfaces/damage/damage-step'
import { collectHooks } from './collect-hooks'
/**
 * Hit check stage
 */
export class HitCheckStep implements IDamageStep {
  execute(event: DamageEvent, context: ICombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // Execute hooks
    for (const hook of hooks) {
      if (hook.onHitCheck) {
        hook.onHitCheck(event, context)
      }
    }
    // Hit check
    const accuracy = event.source.getAttribute('accuracy')
    const evasion = event.target.getAttribute('evasion')
    const hitChance = calculateHitChance(accuracy, evasion)
    event.isHit = context.rng.next() < hitChance
    // If miss, send event and terminate process
    if (!event.isHit) {
      context.eventBus.emit('combat:miss', {
        sourceId: event.source.id,
        targetId: event.target.id,
        tick: event.tick,
      })
      return false
    }
    return true
  }
}
