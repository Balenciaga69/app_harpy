/**
 * 傷害計算工具函數
 * 提供護甲減免、命中率、閃避率等計算公式
 */
/**
 * 計算護甲減免百分比
 * @param armor 護甲值
 * @param damage 傷害值
 * @returns 減免百分比 (0-1)
 */
export function calculateArmorReduction(armor: number, damage: number): number {
  if (armor <= 0) return 0
  // TODO: 實作護甲減免公式（需要根據遊戲設計調整）
  // 暫時使用簡單公式：reduction = armor / (armor + damage)
  const reduction = armor / (armor + damage * 5)
  return Math.min(0.9, Math.max(0, reduction)) // 限制在 0-90%
}
/**
 * 計算命中率
 * @param accuracy 命中值
 * @param evasion 閃避值
 * @returns 命中率 (0-1)
 */
export function calculateHitChance(accuracy: number, evasion: number): number {
  if (evasion <= 0) return 1 // 沒有閃避，必中
  // TODO: 實作命中率公式（需要根據遊戲設計調整）
  // 暫時使用簡單公式
  const hitChance = accuracy / (accuracy + evasion)
  return Math.min(1, Math.max(0.1, hitChance)) // 限制在 10-100%
}
/**
 * 計算閃避率
 * @param accuracy 命中值
 * @param evasion 閃避值
 * @returns 閃避率 (0-1)
 */
export function calculateEvasionChance(accuracy: number, evasion: number): number {
  return 1 - calculateHitChance(accuracy, evasion)
}
/**
 * 計算暴擊倍率後的傷害
 * @param baseDamage 基礎傷害
 * @param critMultiplier 暴擊倍率（預設 1.5）
 * @returns 暴擊後的傷害
 */
export function applyCritMultiplier(baseDamage: number, critMultiplier: number = 1.5): number {
  return baseDamage * critMultiplier
}
