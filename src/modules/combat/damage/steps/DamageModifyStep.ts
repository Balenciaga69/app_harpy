import type { CombatContext } from '../../context/combat.context'
import type { DamageEvent } from '../models'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * 傷害修飾階段
 */
export class DamageModifyStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.onDamageModify) {
        hook.onDamageModify(event, context)
      }
    }
    return true // 繼續執行
  }
}
