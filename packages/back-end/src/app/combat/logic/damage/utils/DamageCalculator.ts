import { ArmorFormula, EvasionFormula, CriticalFormula } from '@/app/combat/infra/config'
export function calculateArmorReduction(armor: number): number {
  return ArmorFormula.calculate(armor)
}
export function calculateEvasionChance(evasion: number, accuracy: number): number {
  return EvasionFormula.calculate(evasion, accuracy)
}
export function calculateHitChance(accuracy: number, evasion: number): number {
  return 1 - calculateEvasionChance(evasion, accuracy)
}
export function applyCritMultiplier(baseDamage: number, critMultiplier?: number): number {
  return CriticalFormula.calculate(baseDamage, critMultiplier)
}
