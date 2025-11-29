import type { Character } from '../../character/character.model'
import { useCombatStatusStore } from '../combatStatus.store'
import { useEventStore } from '../../eventCore/event.store'
import type { AttackPayload } from '../handlerPayload.type'
/** 攻擊調度器 - 負責安排下一次攻擊 */
export class AttackScheduler {
  scheduleNextAttack(attacker: Character, payload: AttackPayload): void {
    if (!attacker.stats.weapon) return
    const { currentTick } = useCombatStatusStore.getState()
    const { addNormalEvent } = useEventStore.getState()
    addNormalEvent({
      type: 'attack',
      tick: currentTick + attacker.stats.weapon.cooldown,
      payload: { attackerId: payload.attackerId, targetId: payload.targetId },
    })
  }
}
