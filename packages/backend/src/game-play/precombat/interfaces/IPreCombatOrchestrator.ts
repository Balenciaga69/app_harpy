import type { IPreCombatState } from './IPreCombatState'
import type { IEncounterContext } from './IEncounterContext'
import type { IPlayerSummary } from './IPlayerSummary'
import type { IBetRequest } from './IBettingService'
import type { IRerollResult } from './IRerollController'

/**
 * PreCombat 編排器介面
 *
 * 提供高階 API 整合所有 PreCombat 流程
 */
export interface IPreCombatOrchestrator {
  /**
   * 生成賽前準備狀態
   * @param encounterContext 遭遇戰上下文
   * @param playerSummary 玩家摘要
   * @param seed 隨機種子（選用）
   * @returns 賽前準備狀態
   */
  generatePreCombat(
    encounterContext: IEncounterContext,
    playerSummary: IPlayerSummary,
    seed?: string | number
  ): IPreCombatState

  /**
   * 下注
   * @param state 當前賽前狀態
   * @param betRequest 下注請求
   * @returns 更新後的賽前狀態
   */
  placeBet(state: IPreCombatState, betRequest: IBetRequest): IPreCombatState

  /**
   * Reroll 變數
   * @param state 當前賽前狀態
   * @param playerSummary 玩家摘要
   * @param seed 新的隨機種子
   * @returns 更新後的賽前狀態與 reroll 結果
   */
  rerollVariables(
    state: IPreCombatState,
    playerSummary: IPlayerSummary,
    seed: string | number
  ): { state: IPreCombatState; rerollResult: IRerollResult }

  /**
   * 確認並準備進入戰鬥
   * @param state 當前賽前狀態
   * @returns 確認後的賽前狀態
   */
  confirmAndStartCombat(state: IPreCombatState): IPreCombatState
}
