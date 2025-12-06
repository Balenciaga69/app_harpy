import type { IEffectLifeHook } from './effect-life-hook'
import type { ICharacterStateHook } from './character-state-hook'
/**
 * 效果介面
 *
 * 所有效果的基礎介面。效果可以透過實作戰鬥掛鉤來修改角色屬性或攔截戰鬥事件。
 * 每個效果必須有唯一的 ID 和名稱，用於識別和日誌記錄。
 *
 * 繼承 IEffectLifeHook 以提供生命週期管理（onApply/onRemove/onTick）。
 * 繼承 ICharacterStateHook 以回應角色狀態變化（onRevive/onHpZero）。
 * 需要修改傷害的效果還應實作 ICombatHook。
 */
export interface IEffect extends IEffectLifeHook, ICharacterStateHook {
  readonly id: string
  readonly name: string
  readonly cleanseOnRevive: boolean
}
