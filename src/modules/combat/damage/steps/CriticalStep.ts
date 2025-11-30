import type { CombatContext } from '../../context'
import type { DamageEvent } from '../models'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * 暴擊判定階段
 */
export class CriticalStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // 執行 Hook
    for (const hook of hooks) {
      if (hook.onCritCheck) {
        hook.onCritCheck(event, context)
      }
    }
    // 進行暴擊判定
    const critChance = event.source.getAttribute('criticalChance') ?? 0
    event.isCrit = context.rng.next() < critChance
    // 如果暴擊，套用暴擊倍率
    if (event.isCrit) {
      const critMultiplier = event.source.getAttribute('criticalMultiplier') ?? 1.5
      event.amount *= critMultiplier
      // 發送暴擊事件
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
