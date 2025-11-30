import type { CombatContext } from '../../context/combat.context'
import type { DamageEvent } from '../models'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * 最終確認階段
 */
export class BeforeApplyStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    for (const hook of hooks) {
      if (hook.beforeDamageApply) {
        hook.beforeDamageApply(event, context)
      }
    }
    // 檢查是否被阻止
    if (event.prevented) {
      context.eventBus.emit('combat:prevented', {
        sourceId: event.source.id,
        targetId: event.target.id,
        reason: 'damage-prevented-by-effect',
        tick: event.tick,
      })
      return false // 終止流程
    }
    return true // 繼續執行
  }
}
