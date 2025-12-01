import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models/damage.event.model'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * ?´æ??¤å??Žæ®µ
 */
export class CriticalStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // ?·è? Hook
    for (const hook of hooks) {
      if (hook.onCritCheck) {
        hook.onCritCheck(event, context)
      }
    }
    // ?²è??´æ??¤å?
    const critChance = event.source.getAttribute('criticalChance') ?? 0
    event.isCrit = context.rng.next() < critChance
    // å¦‚æ??´æ?ï¼Œå??¨æš´?Šå€ç?
    if (event.isCrit) {
      const critMultiplier = event.source.getAttribute('criticalMultiplier') ?? 1.5
      event.amount *= critMultiplier
      // ?¼é€æš´?Šä?ä»?
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
