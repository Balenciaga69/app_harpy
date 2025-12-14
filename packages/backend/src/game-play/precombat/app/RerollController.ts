import type { IRerollController, IRerollCost, IRerollResult, IPlayerSummary, IPreCombatVariable } from '../interfaces'
import type { IVariableGenerator } from '../interfaces'

/**
 * Reroll 成本策略
 */
export interface IRerollCostStrategy {
  /**
   * 計算 reroll 成本
   * @param rerollCount 已使用的 reroll 次數
   * @param playerAssets 玩家總資產
   * @returns 金幣成本
   */
  calculateCost(rerollCount: number, playerAssets: number): number
}

/**
 * 預設 Reroll 成本策略（指數增長）
 */
export class ExponentialRerollCostStrategy implements IRerollCostStrategy {
  private baseCost: number
  private multiplier: number

  constructor(baseCost = 500, multiplier = 2.0) {
    this.baseCost = baseCost
    this.multiplier = multiplier
  }

  calculateCost(rerollCount: number, playerAssets: number): number {
    // 成本 = baseCost * (multiplier ^ rerollCount)
    const cost = Math.floor(this.baseCost * Math.pow(this.multiplier, rerollCount))
    // 不超過玩家總資產的 80%
    const maxCost = Math.floor(playerAssets * 0.8)
    return Math.min(cost, maxCost)
  }
}

/**
 * Reroll 控制器實作
 */
export class RerollController implements IRerollController {
  private costStrategy: IRerollCostStrategy
  private variableGenerator: IVariableGenerator

  constructor(variableGenerator: IVariableGenerator, costStrategy?: IRerollCostStrategy) {
    this.variableGenerator = variableGenerator
    this.costStrategy = costStrategy || new ExponentialRerollCostStrategy()
  }

  /* 計算 reroll 成本 */
  calculateCost(playerSummary: IPlayerSummary, currentRerollCount: number): IRerollCost {
    // 檢查是否還有可用次數
    const remainingRerolls = playerSummary.maxRerolls === -1 ? -1 : playerSummary.maxRerolls - currentRerollCount

    if (remainingRerolls === 0) {
      return {
        goldCost: 0,
        canAfford: false,
        remainingRerolls: 0,
      }
    }

    const goldCost = this.costStrategy.calculateCost(currentRerollCount, playerSummary.totalAssets)

    return {
      goldCost,
      canAfford: playerSummary.availableGold >= goldCost,
      remainingRerolls,
    }
  }

  /* 執行 reroll */
  reroll(currentVariables: IPreCombatVariable[], playerSummary: IPlayerSummary, seed: string | number): IRerollResult {
    const cost = this.calculateCost(playerSummary, playerSummary.rerollsUsed)

    if (!cost.canAfford) {
      throw new Error(`無法負擔 reroll 成本: 需要 ${cost.goldCost}，但只有 ${playerSummary.availableGold}`)
    }

    if (cost.remainingRerolls === 0) {
      throw new Error('已達 reroll 次數上限')
    }

    // 使用變數生成器重新生成（需要從外部提供 encounterContext）
    // 這裡先返回空陣列，實際實作會由 Orchestrator 處理
    const newVariables: IPreCombatVariable[] = []

    return {
      newVariables,
      goldSpent: cost.goldCost,
      updatedRerollsUsed: playerSummary.rerollsUsed + 1,
      seed,
    }
  }
}
