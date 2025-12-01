import type { CombatContext } from '@/modules/combat/context'
import type { DamageEvent } from '../models/damage.event.model'
import type { IDamageStep } from './DamageStep.interface'
/**
 * ?‰ç”¨?·å®³?æ®µ
 */
export class ApplyDamageStep implements IDamageStep {
  execute(event: DamageEvent, context: CombatContext): boolean {
    // ä½¿ç”¨ amount ä½œç‚º?€çµ‚å‚·å®³ï?å·²ç??æš´?Šã€é˜²ç¦¦è?ç®—ï?
    event.finalDamage = Math.max(0, event.amount)
    // ?‰ç”¨?·å®³ï¼ˆæ‰£??HPï¼?
    const currentHp = event.target.getAttribute('currentHp')
    const newHp = Math.max(0, currentHp - event.finalDamage)
    event.target.setCurrentHpClamped(newHp)
    // ?¼é€å‚·å®³ä?ä»?
    context.eventBus.emit('entity:damage', {
      targetId: event.target.id,
      amount: event.finalDamage,
      sourceId: event.source.id,
    })
    // æª¢æŸ¥?¯å¦æ­»äº¡
    if (newHp <= 0 && !event.target.isDead) {
      event.target.isDead = true
      context.eventBus.emit('entity:death', {
        targetId: event.target.id,
      })
    }
    return true
  }
}
