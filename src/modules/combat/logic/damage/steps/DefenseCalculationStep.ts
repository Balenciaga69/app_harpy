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
    // 執行 Hook
    for (const hook of hooks) {
      if (hook.onDefenseCalculation) {
        hook.onDefenseCalculation(event, context)
      }
    }
    // 真實傷害無視防禦
    if (event.isTrueDamage) {
      return true
    }
    // 計算護甲減免
    const armor = event.target.getAttribute('armor')
    const armorReduction = this.calculateArmorReduction(armor)
    // 應用減免
    event.amount *= 1 - armorReduction
    return true
  }
  /** 計算護甲減免百分比 */
  private calculateArmorReduction(armor: number): number {
    // 簡化公式: 減免% = armor / (armor + 100)
    // 例如: 50護甲 = 33%減免, 100護甲 = 50%減免
    return armor / (armor + 100)
  }
}
