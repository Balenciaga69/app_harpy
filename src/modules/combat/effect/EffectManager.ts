import type { IEffect } from './models/effect.model'
import type { ICharacter } from '../character/interfaces/character.interface'
import type { CombatContext } from '../core/CombatContext'
/** 角色效果管理器 (ECS Component) */
export class EffectManager {
  private effects: Map<string, IEffect> = new Map()
  private readonly owner: ICharacter
  constructor(owner: ICharacter) {
    this.owner = owner
  }
  /** 添加效果 */
  addEffect(effect: IEffect, context: CombatContext): void {
    if (this.effects.has(effect.id)) {
      return // 避免重複添加
    }
    this.effects.set(effect.id, effect)
    effect.onApply(this.owner, context)
  }
  /** 移除效果 */
  removeEffect(effectId: string, context: CombatContext): void {
    const effect = this.effects.get(effectId)
    if (!effect) return
    effect.onRemove(this.owner, context)
    this.effects.delete(effectId)
  }
  /** 獲取效果 */
  getEffect(effectId: string): IEffect | undefined {
    return this.effects.get(effectId)
  }
  /** 檢查是否有效果 */
  hasEffect(effectId: string): boolean {
    return this.effects.has(effectId)
  }
  /** 獲取所有效果 */
  getAllEffects(): readonly IEffect[] {
    return Array.from(this.effects.values())
  }
  /** 每個 Tick 調用所有效果 */
  onTick(context: CombatContext): void {
    this.effects.forEach((effect) => {
      effect.onTick?.(this.owner, context)
    })
  }
  /** 清除所有效果 */
  clear(context: CombatContext): void {
    this.effects.forEach((effect) => {
      effect.onRemove(this.owner, context)
    })
    this.effects.clear()
  }
}
