/**
 * 護甲對該傷害的減免量
 * 護甲公式: (護甲值 x 傷害) / (護甲值 + 10X傷害) [無上限]
 */
function calculateArmorDamage(armor: number, damage: number): number {
  if (damage <= 0) return 0
  return (armor * damage) / (armor + 10 * damage)
}
/**
 * 計算命中率
 * 命中公式: 1 - (敵方閃避／(敵方閃避 + 2X命中值)) [命中上限 95%]
 */
function calculateHitChance(evasion: number, accuracy: number): number {
  if (accuracy <= 0) return 0
  const hitChance = 1 - evasion / (evasion + 2 * accuracy)
  return Math.min(hitChance, 0.95)
}
export const calculator = {
  calculateArmorDamage,
  calculateHitChance,
}
