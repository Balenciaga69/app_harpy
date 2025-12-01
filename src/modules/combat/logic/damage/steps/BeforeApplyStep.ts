import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models/damage.event.model'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * ?€çµ‚ç¢ºèªé?æ®?
 */
export class BeforeApplyStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.beforeDamageApply) {
        hook.beforeDamageApply(event, context)
      }
    }
    // æª¢æŸ¥?¯å¦è¢«é˜»æ­?
    if (event.prevented) {
      context.eventBus.emit('combat:prevented', {
        sourceId: event.source.id,
        targetId: event.target.id,
        reason: 'damage-prevented-by-effect',
        tick: event.tick,
      })
      return false // çµ‚æ­¢æµç?
    }
    return true // ç¹¼ç??·è?
  }
}
