import { nanoid } from 'nanoid'
import { useCharacterStore } from '../../character/character.store'
import { useCombatLogStore } from '../../combatLog/combatLog.store'
import { Effect, EffectManager } from '../../effect/effect.model'
import { EFFECT_CONFIGS } from '../../effect/effectCalculator.util'
import { useCombatStatusStore } from '../combatStatus.store'
import type { ApplyEffectPayload } from '../handlerPayload.type'
/**
 * 效果應用處理器 - 負責應用異常狀態效果
 */
export class EffectHandler {
  handle(payload: ApplyEffectPayload): void {
    const { getCharacter } = useCharacterStore.getState()
    const { currentTick } = useCombatStatusStore.getState()
    const { addLog } = useCombatLogStore.getState()
    const target = getCharacter(payload.targetId)
    if (!target) return
    const effectManager = target.getEffectManager()
    const effectId = nanoid()
    // 根據效果類型處理
    const expireAt = payload.durationTicks === -1 ? -1 : currentTick + payload.durationTicks
    switch (payload.effectType) {
      case 'holyFire':
        this.applyHolyFire(effectManager, effectId, payload.layers, currentTick, expireAt)
        break
      case 'poison':
        this.applyPoison(effectManager, effectId, payload.layers, currentTick, expireAt)
        break
      case 'chill':
        this.applyChill(effectManager, effectId, payload.layers, currentTick, expireAt)
        break
      case 'charge':
        this.applyCharge(effectManager, effectId, payload.layers, currentTick, expireAt)
        break
      case 'blind':
        this.applyBlind(effectManager, effectId, currentTick, expireAt)
        break
    }
    // 記錄效果應用 log（快照由 store 自動處理）
    addLog({
      tick: currentTick,
      type: 'effect_apply',
      actorId: payload.targetId,
      value: payload.layers,
      detail: {
        effectType: payload.effectType,
        durationTicks: payload.durationTicks,
      },
    } as const)
  }
  /** 應用聖火 */
  private applyHolyFire(
    effectManager: EffectManager,
    effectId: string,
    layers: number,
    currentTick: number,
    expireAt: number
  ): void {
    const existing = effectManager.getEffectsByType('holyFire')
    if (existing.length > 0) {
      // 如果已有聖火，疊加層數（無上限）
      existing[0].addLayers(layers)
      existing[0].maxHpIncreased += layers * 0.01 // 永久增加
    } else {
      const effect = new Effect(effectId, 'holyFire', layers, currentTick, expireAt)
      effectManager.addEffect(effect)
    }
  }
  /** 應用中毒 */
  private applyPoison(
    effectManager: EffectManager,
    effectId: string,
    layers: number,
    currentTick: number,
    expireAt: number
  ): void {
    const effect = new Effect(effectId, 'poison', layers, currentTick, expireAt)
    effectManager.addEffect(effect)
  }
  /** 應用冰緩 */
  private applyChill(
    effectManager: EffectManager,
    effectId: string,
    layers: number,
    currentTick: number,
    expireAt: number
  ): void {
    const existing = effectManager.getEffectsByType('chill')
    const maxLayers = EFFECT_CONFIGS.chill.maxLayers
    if (existing.length > 0) {
      existing[0].addLayers(layers, maxLayers)
    } else {
      const effect = new Effect(effectId, 'chill', Math.min(layers, maxLayers), currentTick, expireAt)
      effectManager.addEffect(effect)
    }
  }
  /** 應用充能 */
  private applyCharge(
    effectManager: EffectManager,
    effectId: string,
    layers: number,
    currentTick: number,
    expireAt: number
  ): void {
    const existing = effectManager.getEffectsByType('charge')
    const maxLayers = EFFECT_CONFIGS.charge.maxLayers
    if (existing.length > 0) {
      existing[0].addLayers(layers, maxLayers)
    } else {
      const effect = new Effect(effectId, 'charge', Math.min(layers, maxLayers), currentTick, expireAt)
      effectManager.addEffect(effect)
    }
  }
  /** 應用致盲 */
  private applyBlind(effectManager: EffectManager, effectId: string, currentTick: number, expireAt: number): void {
    const existing = effectManager.getEffectsByType('blind')
    if (existing.length === 0) {
      // 致盲無法疊加
      const effect = new Effect(effectId, 'blind', 1, currentTick, expireAt)
      effectManager.addEffect(effect)
    } else {
      // 只更新過期時間
      existing[0].expireAt = expireAt
    }
  }
}
