import { nanoid } from 'nanoid'
import type { ICharacter } from '../../../character'
import type { CombatContext } from '../../../../context'
import type { DamageEvent, ICombatHook } from '../../../../damage'
import type { IEffect } from '../../models/effect.model'
/**
 * 低血護甲增幅效果
 *
 * 獨特裝備效果：
 * - 當生命值低於 30% 時，護甲 x2
 * - 透過修改 DamageChain 的防禦計算來實作
 */
export class LowHealthArmorEffect implements IEffect, ICombatHook {
  readonly id: string
  readonly name: string = '危機護甲'
  private readonly healthThreshold: number = 0.3 // 30%
  private readonly armorMultiplier: number = 2 // 2倍
  constructor() {
    this.id = `low-hp-armor-${nanoid(6)}`
  }
  onApply(_character: ICharacter, _context: CombatContext): void {
    // 被動效果，不需要初始化
  }
  onRemove(_character: ICharacter, _context: CombatContext): void {
    // 被動效果，不需要清理
  }
  /**
   * 【階段5】防禦計算階段
   * 如果生命值低於 30%，護甲值加倍，減免更多物理傷害
   */
  onDefenseCalculation(event: DamageEvent, context: CombatContext): DamageEvent {
    // 只處理目標是自己的情況（受到傷害時）
    if (event.target.id !== this.getOwner(event, context)?.id) {
      return event
    }
    // 檢查生命值是否低於門檻
    const currentHp = event.target.getAttribute('currentHp')
    const maxHp = event.target.getAttribute('maxHp')
    const healthPercent = currentHp / maxHp
    if (healthPercent < this.healthThreshold) {
      // 計算加倍的護甲減免
      const baseArmor = event.target.getAttribute('armor')
      const boostedArmor = baseArmor * this.armorMultiplier
      // 計算護甲減免百分比
      const armorReduction = boostedArmor / (boostedArmor + 100)
      // 對傷害應用額外減免
      const additionalReduction = armorReduction - baseArmor / (baseArmor + 100)
      event.amount *= 1 - additionalReduction
    }
    return event
  }
  /** 輔助方法：獲取效果的擁有者 */
  private getOwner(event: DamageEvent, _context: CombatContext): ICharacter | null {
    // 檢查攻擊者是否擁有此效果
    if (event.source.hasEffect(this.id)) {
      return event.source
    }
    // 檢查目標是否擁有此效果
    if (event.target.hasEffect(this.id)) {
      return event.target
    }
    return null
  }
}
