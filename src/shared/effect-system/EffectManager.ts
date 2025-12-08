import type { IEffect } from './models/effect'
import type { IEffectServices } from './models/effect-services'

/**
 * 效果管理器
 *
 * 管理附加到角色的效果實例。
 * 此類別位於共享層，可被戰鬥內外使用。
 *
 * 設計原則：
 * - 僅依賴 IEffectServices 介面，不依賴具體實現
 * - 透過服務定位器模式取得角色操作能力
 * - 不持有角色引用，僅持有角色 ID
 */
export class EffectManager {
  private effects: Map<string, IEffect> = new Map()
  private readonly ownerId: string

  constructor(ownerId: string) {
    this.ownerId = ownerId
  }

  /**
   * 添加效果
   * @param effect 效果實例
   * @param services 服務提供者
   */
  addEffect(effect: IEffect, services: IEffectServices): void {
    if (this.effects.has(effect.id)) {
      return // 避免重複添加
    }

    this.effects.set(effect.id, effect)
    effect.onApply?.(this.ownerId, services)
  }

  /**
   * 移除效果
   * @param effectId 效果 ID
   * @param services 服務提供者
   */
  removeEffect(effectId: string, services: IEffectServices): void {
    const effect = this.effects.get(effectId)
    if (!effect) return

    effect.onRemove?.(this.ownerId, services)
    this.effects.delete(effectId)
  }

  /**
   * 取得效果
   */
  getEffect(effectId: string): IEffect | undefined {
    return this.effects.get(effectId)
  }

  /**
   * 檢查是否擁有效果
   */
  hasEffect(effectId: string): boolean {
    return this.effects.has(effectId)
  }

  /**
   * 取得所有效果
   */
  getAllEffects(): readonly IEffect[] {
    return Array.from(this.effects.values())
  }

  /**
   * 清除指定條件的效果
   * 用於復活時清除 Debuff
   */
  cleanseEffects(predicate: (effect: IEffect) => boolean, services: IEffectServices): void {
    const effectsToRemove: string[] = []

    this.effects.forEach((effect) => {
      if (predicate(effect)) {
        effectsToRemove.push(effect.id)
      }
    })

    effectsToRemove.forEach((effectId) => {
      this.removeEffect(effectId, services)
    })
  }

  /**
   * 清除復活時可清除的效果
   */
  cleanseOnRevive(services: IEffectServices): void {
    this.cleanseEffects((effect) => effect.cleanseOnRevive, services)
  }

  /**
   * 觸發所有效果的 onHpZero 鉤子
   */
  triggerHpZero(services: IEffectServices): void {
    this.effects.forEach((effect) => {
      effect.onHpZero?.(this.ownerId, services)
    })
  }

  /**
   * 觸發所有效果的 onRevive 鉤子
   */
  triggerRevive(services: IEffectServices): void {
    this.effects.forEach((effect) => {
      effect.onRevive?.(this.ownerId, services)
    })
  }
}
