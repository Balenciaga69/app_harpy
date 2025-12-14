import type { IPreCombatVariable } from './IPreCombatVariable'
import type { IPlayerSummary } from './IPlayerSummary'

/**
 * Reroll 成本計算結果
 */
export interface IRerollCost {
  /** 金幣成本 */
  goldCost: number
  /** 是否可負擔 */
  canAfford: boolean
  /** 剩餘可用 reroll 次數（-1 表示無限制） */
  remainingRerolls: number
}

/**
 * Reroll 結果
 */
export interface IRerollResult {
  /** 新的變數列表 */
  newVariables: IPreCombatVariable[]
  /** 消耗的金幣 */
  goldSpent: number
  /** 更新後的 reroll 使用次數 */
  updatedRerollsUsed: number
  /** 使用的隨機種子 */
  seed: string | number
}

/**
 * Reroll 控制器介面
 *
 * 處理變數 reroll 流程
 */
export interface IRerollController {
  /**
   * 計算 reroll 成本
   * @param playerSummary 玩家摘要
   * @param currentRerollCount 當前已使用的 reroll 次數
   * @returns 成本計算結果
   */
  calculateCost(playerSummary: IPlayerSummary, currentRerollCount: number): IRerollCost

  /**
   * 執行 reroll
   * @param currentVariables 當前變數
   * @param playerSummary 玩家摘要
   * @param seed 新的隨機種子
   * @returns Reroll 結果
   */
  reroll(currentVariables: IPreCombatVariable[], playerSummary: IPlayerSummary, seed: string | number): IRerollResult
}
