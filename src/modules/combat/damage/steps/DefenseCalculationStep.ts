import type { CombatContext } from '../../context'
import type { DamageEvent } from '../models'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
/**
 * 防禦計算階段
 */
export class DefenseCalculationStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // 先執行 Hook（可能會修改防禦計算）
    for (const hook of hooks) {
      if (hook.onDefenseCalculation) {
        hook.onDefenseCalculation(event, context)
      }
    }
    // TODO: 未來實作分別的元素抗性
    // 目前暫時只處理物理護甲
    const armor = event.target.getAttribute('armor')
    const armorReduction = this.calculateArmorReduction(armor)
    // 只對物理傷害應用護甲減免
    event.damages.physical *= 1 - armorReduction
    return true // 繼續執行
  }
  /** 計算護甲減免百分比 */
  private calculateArmorReduction(armor: number): number {
    // 簡化公式: 減免% = armor / (armor + 100)
    // 例如: 50護甲 = 33%減免, 100護甲 = 50%減免
    return armor / (armor + 100)
  }
}
