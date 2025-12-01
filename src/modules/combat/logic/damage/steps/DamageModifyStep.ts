import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models/damage.event.model'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * ?·å®³ä¿®é£¾?Žæ®µ
 */
export class DamageModifyStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.onDamageModify) {
        hook.onDamageModify(event, context)
      }
    }
    return true // ç¹¼ç??·è?
  }
}
