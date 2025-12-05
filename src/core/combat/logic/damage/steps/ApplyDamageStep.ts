import type { CombatContext } from '@/core/combat'
import type { DamageEvent } from '../models/damage-event'
import type { IDamageStep } from './DamageStep.interface'

/**
 * ApplyDamageStep: Final step that applies calculated damage to target.
 */
export class ApplyDamageStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    // Use amount as final damage (already includes crit and defense calculations)
    event.finalDamage = Math.max(0, event.amount)
    // Apply damage (reduce HP)
    const currentHp = event.target.getAttribute('currentHp')
    const newHp = Math.max(0, currentHp - event.finalDamage)
    event.target.setCurrentHpClamped(newHp)

    // Emit damage event
    context.eventBus.emit('entity:damage', {
      sourceId: event.source.id,
      targetId: event.target.id,
      amount: event.amount,
      finalDamage: event.finalDamage,
      isCritical: event.isCrit,
      damageType: event.isUltimate ? 'ultimate' : event.isTrueDamage ? 'true' : 'normal',
      tick: event.tick,
    })

    // Check if target died
    if (newHp <= 0 && !event.target.isDead) {
      event.target.isDead = true
      context.eventBus.emit('entity:death', {
        targetId: event.target.id,
        killerId: event.source.id,
        tick: event.tick,
      })
    }
    return true
  }
}
