import { nanoid } from 'nanoid'
import type { IEffect, ICombatHook } from '../../models/effect.model'
import type { ICharacter } from '../../../character/models/character.model'
import type { CombatContext } from '../../../core/CombatContext'
import type { DamageEvent } from '../../../damage'
import { calculateArmorReduction } from '../../../damage/utils/damageCalculator.util'
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
   * 如果生命值低於 30%，護甲值加倍
   */
  onDefenseCalculation(event: DamageEvent, context: CombatContext): DamageEvent {
    // 只處理目標是自己的情況（受到傷害時）
    if (event.target.id !== this.getOwner(event, context)?.id) {
      return event
    }
    // 檢查生命值是否低於門檻
    const currentHp = event.target.attributes.get('currentHp')
    const maxHp = event.target.attributes.get('maxHp')
    const healthPercent = currentHp / maxHp
    if (healthPercent < this.healthThreshold) {
      // 重新計算護甲減免，使用加倍的護甲值
      const baseArmor = event.target.attributes.get('armor')
      const boostedArmor = baseArmor * this.armorMultiplier
      // 重新計算護甲減免
      event.armorReduction = calculateArmorReduction(boostedArmor, event.baseDamage)
      // 重新應用護甲減免
      event.finalDamage = event.finalDamage * (1 - event.armorReduction)
    }
    return event
  }
  /** 輔助方法：獲取效果的擁有者 */
  private getOwner(event: DamageEvent, _context: CombatContext): ICharacter | null {
    // 檢查攻擊者是否擁有此效果
    if (event.source.effects.hasEffect(this.id)) {
      return event.source
    }
    // 檢查目標是否擁有此效果
    if (event.target.effects.hasEffect(this.id)) {
      return event.target
    }
    return null
  }
}
