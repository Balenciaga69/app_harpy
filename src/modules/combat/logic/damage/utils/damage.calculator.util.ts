import { ArmorFormula, EvasionFormula, CriticalFormula } from '@/modules/combat/infra/config'
/**
 * 計算護甲減免百分比
 *
 * 公式：armor / (armor + K)
 * - K = 100（可配置）
 * - 護甲 100 → 50% 減免
 * - 護甲 600 → 85.7% 減免
 * - 最大減免 90%
 *
 * @param armor 護甲值
 * @returns 減免百分比
 */
export function calculateArmorReduction(armor: number): number {
  return ArmorFormula.calculate(armor)
}
/**
 * 計算閃避率
 *
 * 公式：(evasion - accuracy) / 100
 * - 最小 5%
 * - 最大 80%
 *
 * @param evasion 閃避值
 * @param accuracy 命中值
 * @returns 閃避率 (0.05-0.8)
 */
export function calculateEvasionChance(evasion: number, accuracy: number): number {
  return EvasionFormula.calculate(evasion, accuracy)
}
/**
 * 計算命中率
 * @param accuracy 命中值
 * @param evasion 閃避值
 * @returns 命中率
 */
export function calculateHitChance(accuracy: number, evasion: number): number {
  return 1 - calculateEvasionChance(evasion, accuracy)
}
/**
 * 計算暴擊倍率後的傷害
 * @param baseDamage 基礎傷害
 * @param critMultiplier 暴擊倍率（預設 1.5）
 * @returns 暴擊後的傷害
 */
export function applyCritMultiplier(baseDamage: number, critMultiplier?: number): number {
  return CriticalFormula.calculate(baseDamage, critMultiplier)
}
