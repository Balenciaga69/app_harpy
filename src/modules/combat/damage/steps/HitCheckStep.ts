import type { CombatContext } from '../../context/combat.context'
import type { DamageEvent } from '../models'
import { calculateHitChance } from '../utils/damage.calculator.util'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * 命中判定階段
 */
export class HitCheckStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // 先執行 Hook（可能會修改命中判定）
    for (const hook of hooks) {
      if (hook.onHitCheck) {
        hook.onHitCheck(event, context)
      }
    }
    // 如果 Hook 沒有明確設定命中結果，使用預設邏輯
    const accuracy = event.source.getAttribute('accuracy')
    const evasion = event.target.getAttribute('evasion')
    const hitChance = calculateHitChance(accuracy, evasion)
    event.isHit = context.rng.next() < hitChance
    event.evaded = !event.isHit
    // 如果未命中，發送事件並終止流程
    if (!event.isHit) {
      context.eventBus.emit('combat:miss', {
        sourceId: event.source.id,
        targetId: event.target.id,
        tick: event.tick,
      })
      return false // 終止流程
    }
    return true // 繼續執行
  }
}
