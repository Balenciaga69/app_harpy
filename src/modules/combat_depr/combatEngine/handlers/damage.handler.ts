import { eventEmitter } from '../../eventCore/emitter'
import { useCharacterStore } from '../../character/character.store'
import { useEventStore } from '../../eventCore/event.store'
import { useCombatLogStore } from '../../combatLog/combatLog.store'
import { useCombatStatusStore } from '../combatStatus.store'
import type { DamagePayload, DeathPayload, ApplyEffectPayload } from '../handlerPayload.type'
import type { DamageType } from '../../shared/types/stats.type'
import { calculator } from '../combatCalculator.util'
import { EFFECT_CONFIGS } from '../../effect/effectCalculator.util'
import type { Character } from '../../character/character.model'
/** 傷害處理器 - 負責傷害計算與應用 */
export class DamageHandler {
  handle(payload: DamagePayload): void {
    const { getCharacter } = useCharacterStore.getState()
    const { currentTick } = useCombatStatusStore.getState()
    const { addLog } = useCombatLogStore.getState()
    const target = getCharacter(payload.targetId)
    if (!target) return
    const finalDamage = this.calculateFinalDamage(target, payload.amount)
    target.takeDamage(finalDamage)
    // 記錄傷害 log（快照由 store 自動處理）
    addLog({
      tick: currentTick,
      type: 'damage',
      actorId: payload.targetId,
      value: finalDamage,
      detail: {
        damageType: payload.damageType,
        rawDamage: payload.amount,
        reducedDamage: payload.amount - finalDamage,
      },
    } as const)
    this.applyElementalEffects(payload.damageType, payload.targetId)
    if (target.isDead()) {
      const deathPayload: DeathPayload = { characterId: payload.targetId }
      eventEmitter.emit('death', deathPayload)
    }
  }
  /** 計算最終傷害 */
  private calculateFinalDamage(target: Character, rawDamage: number): number {
    const reducedDamage = calculator.calculateArmorDamage(target.getTotalArmor(), rawDamage)
    return rawDamage - reducedDamage
  }
  /** 應用元素效果 */
  private applyElementalEffects(damageType: DamageType, targetId: string): void {
    const { addImmediateEvent } = useEventStore.getState()
    switch (damageType) {
      case 'ice': {
        const effectPayload: ApplyEffectPayload = {
          targetId,
          effectType: 'chill',
          layers: 1,
          durationTicks: EFFECT_CONFIGS.chill.durationTicks,
        }
        addImmediateEvent({
          type: 'applyEffect',
          payload: effectPayload,
        })
        break
      }
      case 'fire': {
        const effectPayload: ApplyEffectPayload = {
          targetId,
          effectType: 'holyFire',
          layers: 1,
          durationTicks: -1, // 聖火不會過期
        }
        addImmediateEvent({
          type: 'applyEffect',
          payload: effectPayload,
        })
        break
      }
      case 'poison': {
        const effectPayload: ApplyEffectPayload = {
          targetId,
          effectType: 'poison',
          layers: 1,
          durationTicks: EFFECT_CONFIGS.poison.durationTicks,
        }
        addImmediateEvent({
          type: 'applyEffect',
          payload: effectPayload,
        })
        break
      }
      case 'lightning': {
        const effectPayload: ApplyEffectPayload = {
          targetId,
          effectType: 'charge',
          layers: 1,
          durationTicks: EFFECT_CONFIGS.charge.durationTicks,
        }
        addImmediateEvent({
          type: 'applyEffect',
          payload: effectPayload,
        })
        break
      }
      case 'physical':
      default:
        // 物理傷害沒有特殊效果
        break
    }
  }
}
