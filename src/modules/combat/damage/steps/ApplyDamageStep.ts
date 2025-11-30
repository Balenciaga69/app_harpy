import type { CombatContext } from '../../context/combat.context'
import { calculateTotalDamage, type DamageEvent } from '../models'
import type { IDamageStep } from './DamageStep.interface'
/**
 * 應用傷害階段
 */
export class ApplyDamageStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    // 計算最終總傷害
    event.finalDamage = calculateTotalDamage(event.damages)
    // 應用傷害（扣除 HP）
    const currentHp = event.target.getAttribute('currentHp')
    const newHp = Math.max(0, currentHp - event.finalDamage)
    event.target.setCurrentHpClamped(newHp)
    // 發送傷害事件
    context.eventBus.emit('entity:damage', {
      targetId: event.target.id,
      amount: event.finalDamage,
      sourceId: event.source.id,
    })
    // 檢查是否死亡
    if (newHp <= 0 && !event.target.isDead) {
      event.target.isDead = true
      context.eventBus.emit('entity:death', {
        targetId: event.target.id,
      })
    }
    return true // 繼續執行
  }
}
