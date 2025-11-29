import { eventEmitter } from '../../eventCore/emitter'
import { useCharacterStore } from '../../character/character.store'
import { useCombatLogStore } from '../../combatLog/combatLog.store'
import { useCombatStatusStore } from '../combatStatus.store'
import type { AttackPayload, DamagePayload, MissPayload } from '../handlerPayload.type'
import type { WeaponStats } from '../../shared/types/stats.type'
import { calculator } from '../combatCalculator.util'
import { combatRandom } from '../../shared/utils/random.util'
import { AttackScheduler } from './attack.scheduler'
import type { Character } from '../../character/character.model'
/** 攻擊處理器 - 負責攻擊判定與傷害發送 */
export class AttackHandler {
  private readonly scheduler = new AttackScheduler()
  handle(payload: AttackPayload): void {
    const { getCharacter } = useCharacterStore.getState()
    const { currentTick } = useCombatStatusStore.getState()
    const { addLog } = useCombatLogStore.getState()
    const attacker = getCharacter(payload.attackerId)
    const target = getCharacter(payload.targetId)
    // 驗證攻擊有效性
    if (!this.#validateAttack(attacker, target)) return
    // 如果未命中，發送 Miss 事件並安排下一次攻擊
    if (!this.#rollHit(target!, attacker!.stats.weapon!)) {
      const missPayload: MissPayload = {
        attackerId: payload.attackerId,
        targetId: payload.targetId,
      }
      eventEmitter.emit('miss', missPayload)
      // 記錄閃避 log
      addLog({
        tick: currentTick,
        type: 'attack_dodge',
        actorId: payload.attackerId,
        targetId: payload.targetId,
      })
      this.scheduler.scheduleNextAttack(attacker!, payload)
      return
    }
    // 記錄攻擊成功 log
    addLog({
      tick: currentTick,
      type: 'attack',
      actorId: payload.attackerId,
      targetId: payload.targetId,
    })
    // 發送傷害事件
    this.#emitDamages(attacker!.stats.weapon!, payload.targetId)
    // 安排下一次攻擊
    this.scheduler.scheduleNextAttack(attacker!, payload)
  }
  /** 驗證攻擊有效性 */
  #validateAttack(attacker: Character | undefined, target: Character | undefined): boolean {
    // 攻擊者必須"有武器"且"目標存在"且"未死亡"
    return !!(attacker?.stats.weapon && target && !target.isDead())
  }
  /** 擲出是否命中 */
  #rollHit(target: Character, weapon: WeaponStats): boolean {
    const hitChance = calculator.calculateHitChance(target.getTotalEvasion(), weapon.accuracy)
    return combatRandom.next() <= hitChance
  }
  /** 擲出是否為暴擊 */
  #rollCritical(weapon: WeaponStats): number {
    const isCritical = combatRandom.next() < weapon.criticalChance / 100
    const critMultiplier = isCritical ? 2 : 1
    return critMultiplier
  }
  /** 發送傷害事件 */
  #emitDamages(weapon: WeaponStats, targetId: string): void {
    const critMultiplier = this.#rollCritical(weapon)
    for (const dmg of weapon.damages) {
      const damagePayload: DamagePayload = {
        targetId,
        damageType: dmg.type,
        amount: dmg.amount * critMultiplier,
      }
      eventEmitter.emit('damage', damagePayload)
    }
  }
}
