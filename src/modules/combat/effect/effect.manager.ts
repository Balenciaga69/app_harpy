import type { ICharacter } from '../character'
import type { CombatContext } from '../context'
import type { IEffect } from './models/effect.model'
/**
 * EffectManager：負責管理單個角色身上的所有動態效果實例。
 *
 * 設計理念：
 * - 作為 ECS 中的 Component，專注於效果的生命週期管理與更新。
 * - 遵循策略模式，每個效果都是獨立的策略實體，可動態添加/移除。
 * - 與責任鏈模式結合，效果可作為 Hook 參與戰鬥流程（如傷害計算）。
 * - 通過事件驅動實現鬆耦合，確保新增效果不需修改此類。
 * - 提供封裝介面，避免角色類別過於龐大，符合單一職責原則。
 *
 * 主要職責：
 * - 添加/移除效果，並觸發對應的應用/移除邏輯。
 * - 在每個 Tick 中更新所有效果，處理持續性邏輯。
 * - 提供效果查詢與檢查方法，支援條件判斷。
 * - 確保效果唯一性，避免重複添加。
 */
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
