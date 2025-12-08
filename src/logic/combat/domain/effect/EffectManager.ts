/**
 * EffectManager (Combat 包裝層)
 *
 * @deprecated 此類別已移至 shared/effect-system
 * Combat 模組應使用 CombatEffectServices 適配器
 *
 * 保留此檔案以維持向後相容性。
 */

import { EffectManager as SharedEffectManager } from '@/shared/effect-system'
import type { IEffect } from '@/shared/effect-system'
import type { ICombatContext } from '@/logic/combat/context'
import { CombatEffectServices } from '../../adapters'
import type { ICombatEffectHook } from '@/shared/effect-system'

/**
 * Combat 專屬的 EffectManager 包裝類別
 *
 * 保留原有的 API 介面，內部委派給共享的 EffectManager。
 */
export class EffectManager {
  private readonly sharedManager: SharedEffectManager
  private readonly characterId: string

  constructor(characterId: string) {
    this.characterId = characterId
    this.sharedManager = new SharedEffectManager(characterId)
  }

  /** 添加效果並註冊到全局 registry */
  addEffect(effect: IEffect, context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.sharedManager.addEffect(effect, services)

    // 註冊到全局 registry（Combat 專屬）
    context.registry.registerEffect(effect)
  }

  /** 移除效果並從全局 registry 取消註冊 */
  removeEffect(effectId: string, context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.sharedManager.removeEffect(effectId, services)

    // 從全局 registry 移除（Combat 專屬）
    context.registry.unregisterEffect(effectId)
  }

  /** 取得效果 */
  getEffect(effectId: string): IEffect | undefined {
    return this.sharedManager.getEffect(effectId)
  }

  /** 檢查是否擁有效果 */
  hasEffect(effectId: string): boolean {
    return this.sharedManager.hasEffect(effectId)
  }

  /** 取得所有效果 */
  getAllEffects(): readonly IEffect[] {
    return this.sharedManager.getAllEffects()
  }

  /** 每個 tick 呼叫所有效果 */
  onTick(context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.sharedManager.getAllEffects().forEach((effect) => {
      const combatEffect = effect as ICombatEffectHook
      combatEffect.onTick?.(this.characterId, services)
    })
  }

  /** 清除復活時可清除的效果 */
  cleanseCanCleanseEffects(context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.sharedManager.cleanseOnRevive(services)
  }

  /** 觸發 onHpZero 鉤子 */
  triggerHpZero(context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.sharedManager.triggerHpZero(services)
  }

  /** 觸發 onRevive 鉤子 */
  triggerRevive(context: ICombatContext): void {
    const services = new CombatEffectServices(context)
    this.sharedManager.triggerRevive(services)
  }
}
