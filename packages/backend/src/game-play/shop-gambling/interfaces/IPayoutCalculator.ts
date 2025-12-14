import type { ISlotOutcome, IFixedOddsOutcome } from './IGamblingResult'
import type { IGamblingConfig } from './IGamblingConfig'

/**
 * Payout 計算結果
 */
export interface IPayoutCalculation {
  /** 基礎賠付 */
  basePayout: number
  /** House cut（抽成） */
  houseCut: number
  /** 最終賠付 */
  finalPayout: number
  /** 計算細節（可追蹤） */
  details: {
    betAmount: number
    multiplier: number
    houseEdge: number
  }
}

/**
 * Payout 計算器介面
 */
export interface IPayoutCalculator {
  /**
   * 計算 payout
   * @param outcome 遊戲結果
   * @param betAmount 下注金額
   * @param config 賭博配置
   * @returns Payout 計算結果
   */
  calculate(
    outcome: ISlotOutcome | IFixedOddsOutcome | Record<string, unknown>,
    betAmount: number,
    config: IGamblingConfig
  ): IPayoutCalculation
}
