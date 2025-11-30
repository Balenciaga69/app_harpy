import type { CombatContext } from '../../context/combat.context'
import type { DamageEvent } from '../models'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * 傷害應用後階段
 */
export class AfterApplyStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.afterDamageApply) {
        hook.afterDamageApply(event, context)
      }
    }
    return true // 繼續執行
  }
}
