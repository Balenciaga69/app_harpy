import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models/damage.event.model'
import type { IDamageStep } from './DamageStep.interface'
import { collectHooks } from './utils/hookCollector.util'
import { calculateArmorReduction } from '../utils/damage.calculator.util'
/**
 * ?²ç¦¦è¨ˆç??æ®µ
 *
 * ?·è²¬ï¼?
 * - è¨ˆç?è­·ç”²æ¸›å?
 * - ?‰ç”¨æ¸›å??‡åˆ°?·å®³??
 * - ?Ÿå¯¦?·å®³?¡è??²ç¦¦
 */
export class DefenseCalculationStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    const hooks = collectHooks(event.source, event.target)
    // ?·è? Hook
    for (const hook of hooks) {
      if (hook.onDefenseCalculation) {
        hook.onDefenseCalculation(event, context)
      }
    }
    // ?Ÿå¯¦?·å®³?¡è??²ç¦¦
    if (event.isTrueDamage) {
      return true
    }
    // ?²å?è­·ç”²??
    const armor = event.target.getAttribute('armor')
    // è¨ˆç?æ¸›å??‡ï?ä½¿ç”¨çµ±ä??¬å?ï¼?
    const reductionRate = calculateArmorReduction(armor)
    // ?‰ç”¨æ¸›å?
    const reducedDamage = event.amount * (1 - reductionRate)
    // ç¢ºä??€å°å‚·å®³ç‚º 1
    event.amount = Math.max(1, reducedDamage)
    return true
  }
}
