import { ArmorFormula, EvasionFormula, CriticalFormula } from '@/modules/combat/infra/config'
/**
 * Calculate armor reduction percentage
 *
 * Formula: armor / (armor + K)
 * - K = 100 (configurable)
 * - Armor 100 → 50% reduction
 * - Armor 600 → 85.7% reduction
 * - Max reduction 90%
 *
 * @param armor Armor value
 * @returns Reduction percentage
 */
export function calculateArmorReduction(armor: number): number {
  return ArmorFormula.calculate(armor)
}

/**
 * Calculate evasion rate
 *
 * Formula: (evasion - accuracy) / 100
 * - Minimum 5%
 * - Maximum 80%
 *
 * @param evasion Evasion value
 * @param accuracy Accuracy value
 * @returns Evasion rate (0.05-0.8)
 */
export function calculateEvasionChance(evasion: number, accuracy: number): number {
  return EvasionFormula.calculate(evasion, accuracy)
}
/**
 * Calculate hit rate
 * @param accuracy Accuracy value
 * @param evasion Evasion value
 * @returns Hit rate
 */
export function calculateHitChance(accuracy: number, evasion: number): number {
  return 1 - calculateEvasionChance(evasion, accuracy)
}
/**
 * Calculate damage after critical multiplier
 * @param baseDamage Base damage
 * @param critMultiplier Critical multiplier (default 1.5)
 * @returns Damage after critical
 */
export function applyCritMultiplier(baseDamage: number, critMultiplier?: number): number {
  return CriticalFormula.calculate(baseDamage, critMultiplier)
}
