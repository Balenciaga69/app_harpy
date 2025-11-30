import { nanoid } from 'nanoid'
import type { ICharacter } from '../../../character'
import type { CombatContext } from '../../../context'
import type { DamageEvent, ICombatHook } from '../../../damage'
import type { IEffect } from '../../models/effect.model'
/**
 * 充能暴擊增幅效果
 *
 * 獨特裝備效果：
 * - 當角色擁有充能效果時，暴擊率加倍
 * - 透過修改 DamageChain 的暴擊判定來實作
 */
export class ChargedCriticalEffect implements IEffect, ICombatHook {
  readonly id: string
  readonly name: string = '充能暴擊'
  constructor() {
    this.id = `charged-crit-${nanoid(6)}`
  }
  onApply(_character: ICharacter, _context: CombatContext): void {
    // 被動效果，不需要初始化
  }
  onRemove(_character: ICharacter, _context: CombatContext): void {
    // 被動效果，不需要清理
  }
  /**
   * 【階段3】暴擊判定階段
   * 如果角色有充能效果，暴擊率加倍
   */
  onCritCheck(event: DamageEvent, context: CombatContext): DamageEvent {
    // 只處理攻擊者是自己的情況
    if (event.source.id !== this.getOwner(event, context)?.id) {
      return event
    }
    // 檢查是否有充能效果
    const hasCharge = event.source.getAllEffects().some((effect) => effect.name === '充能')
    if (hasCharge && event.tags.has('attack')) {
      // 重新計算暴擊判定，使用加倍的暴擊率
      const baseCritChance = event.source.getAttribute('criticalChance')
      const boostedCritChance = Math.min(1, baseCritChance * 2) // 最高 100%
      event.isCrit = context.rng.next() < boostedCritChance
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
