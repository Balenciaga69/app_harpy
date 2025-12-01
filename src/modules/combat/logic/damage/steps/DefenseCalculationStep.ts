import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
import { calculateArmorReduction } from '../utils/damage.calculator.util'
/**
 * 防禦計算階段
 *
 * 職責：
 * - 計算護甲減免
 * - 應用減免率到傷害值
 * - 真實傷害無視防禦
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
    // 獲取護甲值
    const armor = event.target.getAttribute('armor')
    // 計算減免率（使用統一公式）
    const reductionRate = calculateArmorReduction(armor)
    // 應用減免
    const reducedDamage = event.amount * (1 - reductionRate)
    // 確保最小傷害為 1
    event.amount = Math.max(1, reducedDamage)
    return true
  }
}
