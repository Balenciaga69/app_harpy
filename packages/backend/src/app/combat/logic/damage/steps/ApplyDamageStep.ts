import type { CombatContext } from '@/app/combat'
import type { DamageEvent } from '../models/damage-event'
import type { IDamageStep } from './DamageStep.interface'
import { ResurrectionHandler } from '../utils/ResurrectionHandler'
/**
 * ApplyDamageStep: Final step that applies calculated damage to target.
 * Includes HP zero check, effect triggers, and resurrection check.
 */
export class ApplyDamageStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    event.finalDamage = Math.max(0, event.amount)
    const currentHp = event.target.getAttribute('currentHp')
    const newHp = Math.max(0, currentHp - event.finalDamage)
    event.target.setCurrentHpClamped(newHp)
    this.emitDamageEvent(event, context)
    if (newHp <= 0 && !event.target.isDead) {
      this.emitHpZeroEvent(event, context)
      event.target.triggerHpZero(context)
      const resurrected = this.tryResurrection(event, context)
      if (!resurrected) {
        event.target.isDead = true
        this.emitDeathEvent(event, context)
      }
    }
    return true
  }
  private tryResurrection(event: DamageEvent, context: CombatContext): boolean {
    return ResurrectionHandler.attemptResurrection(event.target, context, event.tick)
  }
  private emitDamageEvent(event: DamageEvent, context: CombatContext) {
    context.eventBus.emit('entity:damage', {
      sourceId: event.source.id,
      targetId: event.target.id,
      amount: event.amount,
      finalDamage: event.finalDamage,
      isCritical: event.isCrit,
      damageType: event.isUltimate ? 'ultimate' : event.isTrueDamage ? 'true' : 'normal',
      tick: event.tick,
    })
  }
  private emitHpZeroEvent(event: DamageEvent, context: CombatContext) {
    context.eventBus.emit('entity:hp-zero', {
      targetId: event.target.id,
      attackerId: event.source.id,
      tick: event.tick,
    })
  }
  private emitDeathEvent(event: DamageEvent, context: CombatContext) {
    context.eventBus.emit('entity:death', {
      targetId: event.target.id,
      killerId: event.source.id,
      tick: event.tick,
    })
  }
}
