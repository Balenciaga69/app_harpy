import type { ICharacter } from '../../character/interfaces/character.interface'
import type { CombatContext } from '../../context/combat.context'
import type { IEffect } from './effect.model'
/**
 * 可堆疊效果介面
 * 用於實作具有層數機制的效果（如聖火、充能、冰緩、毒等）
 */
export interface IStackableEffect extends IEffect {
  /** 當前層數 */
  stacks: number
  /** 最大層數限制（可選） */
  maxStacks?: number
  /** 增加層數 */
  addStacks(amount: number): void
  /** 減少層數 */
  removeStacks(amount: number): void
  /** 設置層數 */
  setStacks(amount: number): void
  /** 獲取當前層數 */
  getStacks(): number
}
/**
 * 可堆疊效果的抽象基類
 * 提供層數管理的基礎實作
 */
export abstract class StackableEffect implements IStackableEffect {
  public stacks: number = 0
  public readonly id: string
  public readonly name: string
  public readonly maxStacks?: number
  constructor(id: string, name: string, maxStacks?: number) {
    this.id = id
    this.name = name
    this.maxStacks = maxStacks
  }
  /** 增加層數 */
  addStacks(amount: number): void {
    this.stacks = Math.min(this.stacks + amount, this.maxStacks ?? Infinity)
  }
  /** 減少層數 */
  removeStacks(amount: number): void {
    this.stacks = Math.max(0, this.stacks - amount)
  }
  /** 設置層數 */
  setStacks(amount: number): void {
    this.stacks = Math.max(0, Math.min(amount, this.maxStacks ?? Infinity))
  }
  /** 獲取當前層數 */
  getStacks(): number {
    return this.stacks
  }
  /** 當效果被添加時調用 */
  abstract onApply(character: ICharacter, context: CombatContext): void
  /** 當效果被移除時調用 */
  abstract onRemove(character: ICharacter, context: CombatContext): void
  /** 每個 Tick 調用（可選） */
  abstract onTick?(character: ICharacter, context: CombatContext): void
}
