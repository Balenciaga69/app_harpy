import type { IEffectLifeHook, ICharacterStateHook } from './effect-hooks'

/**
 * 效果介面
 *
 * 所有效果的基礎介面。
 * 效果可以透過實作各種鉤子來修改角色屬性或回應事件。
 *
 * 設計原則：
 * - 使用基礎服務介面（IEffectServices），支援戰鬥內外使用
 * - 戰鬥專屬功能（如 onTick）透過 ICombatEffectHook 擴展
 * - 介面分離，符合 ISP 原則
 */
export interface IEffect extends IEffectLifeHook, ICharacterStateHook {
  /** 唯一識別碼 */
  readonly id: string

  /** 效果名稱 */
  readonly name: string

  /**
   * 復活時是否清除此效果
   * - true: 復活時清除（用於 Debuff）
   * - false: 復活時保留（用於裝備效果）
   */
  readonly cleanseOnRevive: boolean
}
