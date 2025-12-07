import type { CombatContext } from '@/logic/combat/context'
import type { ICharacter } from '@/logic/combat/domain/character'
import { AttributeLimits } from '@/logic/combat/infra/config'
/**
 * 復活處理器
 *
 * 當角色生命值降至 0 時，處理復活邏輯。
 * 檢查復活機率、恢復生命值，並清除可清除的效果。
 */
export class ResurrectionHandler {
  /**
   * 嘗試讓角色復活
   * @returns 復活成功回傳 true，否則角色死亡回傳 false
   */
  static attemptResurrection(character: ICharacter, context: CombatContext, tick: number): boolean {
    const resurrectionChance = character.getAttribute('resurrectionChance')
    // 若復活機率為 0 或低於最小值則無法復活
    if (resurrectionChance < AttributeLimits.resurrectionChance.min) {
      return false
    }
    // 將復活機率限制在允許範圍內
    const clampedChance = Math.min(
      Math.max(resurrectionChance, AttributeLimits.resurrectionChance.min),
      AttributeLimits.resurrectionChance.max
    )
    // 擲骰判斷是否復活
    const roll = context.rng.next()
    if (roll >= clampedChance) {
      return false // 復活失敗
    }
    // 復活成功！
    this.performResurrection(character, context, tick)
    return true
  }
  private static performResurrection(character: ICharacter, context: CombatContext, tick: number): void {
    // 取得復活後生命值百分比並限制在範圍內
    const resurrectionHpPercent = character.getAttribute('resurrectionHpPercent')
    const clampedPercent = Math.min(
      Math.max(resurrectionHpPercent, AttributeLimits.resurrectionHpPercent.min),
      AttributeLimits.resurrectionHpPercent.max
    )
    // 計算恢復的生命值
    const maxHp = character.getAttribute('maxHp')
    const restoredHp = Math.floor(maxHp * clampedPercent)
    // 恢復生命值
    character.setCurrentHpClamped(restoredHp)
    // 清除帶有 cleanseOnRevive: true 的效果（保留裝備效果）
    character.cleanseCanCleanseEffects(context)
    // 觸發剩餘效果的 onRevive 鉤子
    character.triggerRevive(context)
    // 發送復活事件
    context.eventBus.emit('entity:resurrection', {
      targetId: character.id,
      restoredHp,
      restoredHpPercent: clampedPercent,
      tick,
    })
  }
}
