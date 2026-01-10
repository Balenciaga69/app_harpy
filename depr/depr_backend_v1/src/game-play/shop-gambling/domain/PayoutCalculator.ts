import type {
  IPayoutCalculator,
  IPayoutCalculation,
  IGamblingConfig,
  ISlotOutcome,
  IFixedOddsOutcome,
} from '../interfaces'

/**
 * Payout 計算器實作
 */
export class PayoutCalculator implements IPayoutCalculator {
  /* 計算 payout */
  calculate(
    outcome: ISlotOutcome | IFixedOddsOutcome | Record<string, unknown>,
    betAmount: number,
    config: IGamblingConfig
  ): IPayoutCalculation {
    let multiplier = 0

    // 根據 outcome 類型判斷倍數
    if ('totalMultiplier' in outcome) {
      // Slot outcome
      multiplier = outcome.totalMultiplier
    } else if ('multiplier' in outcome) {
      // FixedOdds outcome
      multiplier = outcome.multiplier
    }

    // 計算基礎賠付
    const basePayout = betAmount * multiplier

    // 計算 house cut（基於 houseEdgeTarget）
    const houseEdge = config.houseEdgeTarget || 0
    const houseCut = basePayout * houseEdge

    // 最終賠付
    const finalPayout = Math.floor(basePayout - houseCut)

    return {
      basePayout,
      houseCut,
      finalPayout,
      details: {
        betAmount,
        multiplier,
        houseEdge,
      },
    }
  }
}
