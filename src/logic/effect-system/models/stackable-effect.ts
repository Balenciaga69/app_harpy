import type { IEffect } from './effect'
import type { IEffectServices, ICombatEffectServices } from './effect-services'

/**
 * 可疊加效果基類
 *
 * 提供疊加層數的管理邏輯。
 * 子類需實現具體的 onApply/onRemove/onTick 邏輯。
 */
export abstract class StackableEffect implements IEffect {
  public readonly id: string
  public readonly name: string
  public readonly cleanseOnRevive: boolean = false // 預設不清除，除非覆蓋
  protected _stacks: number = 0
  protected readonly maxStacks: number

  constructor(id: string, name: string, maxStacks: number = 1) {
    this.id = id
    this.name = name
    this.maxStacks = maxStacks
  }

  /**
   * 取得當前疊加層數
   */
  get stacks(): number {
    return this._stacks
  }

  /**
   * 設定疊加層數（自動夾在 0 到 maxStacks 之間）
   */
  setStacks(stacks: number): void {
    this._stacks = Math.max(0, Math.min(stacks, this.maxStacks))
  }

  /**
   * 增加疊加層數
   */
  addStacks(amount: number): void {
    this.setStacks(this._stacks + amount)
  }

  /**
   * 減少疊加層數
   */
  removeStacks(amount: number): void {
    this.setStacks(this._stacks - amount)
  }

  /**
   * 應用效果（子類實現）
   */
  abstract onApply?(characterId: string, services: IEffectServices): void

  /**
   * 移除效果（子類實現）
   */
  abstract onRemove?(characterId: string, services: IEffectServices): void

  /**
   * 每 tick 觸發（子類實現）
   */
  abstract onTick?(characterId: string, services: ICombatEffectServices): void
}
