import type { CombatContext } from '@/core/combat'
import type { DamageEvent } from '../models/damage-event'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './collect-hooks'
import { calculateArmorReduction } from '../utils/DamageCalculator'
/**
 * DefenseCalculationStep
 *
 * Calculates damage reduction based on target's armor. Handles true damage bypass and applies reduction formula.
 */
export class DefenseCalculationStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // Execute hooks
    for (const hook of hooks) {
      if (hook.onDefenseCalculation) {
        hook.onDefenseCalculation(event, context)
      }
    }
    // Skip defense for true damage
    if (event.isTrueDamage) {
      return true
    }
    // Get armor value
    const armor = event.target.getAttribute('armor')
    // Calculate reduction rate using unified formula
    const reductionRate = calculateArmorReduction(armor)
    // Apply reduction
    const reducedDamage = event.amount * (1 - reductionRate)
    // Ensure minimum damage of 1
    event.amount = Math.max(1, reducedDamage)
    return true
  }
}
