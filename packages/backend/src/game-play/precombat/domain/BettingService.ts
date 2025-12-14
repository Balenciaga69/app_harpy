import type {
  IBettingService,
  IBetRequest,
  IBetValidationResult,
  ICombatBettingResult,
  IBetSettlementRequest,
  IBetSettlementResult,
  IBettingConfig,
} from '../interfaces'
import { DEFAULT_BETTING_CONFIG, getBracketConfig, determineBracket } from './BettingConfig'

/**
 * 下注服務實作
 */
export class BettingService implements IBettingService {
  private config: IBettingConfig

  constructor(config: IBettingConfig = DEFAULT_BETTING_CONFIG) {
    this.config = config
  }

  /* 取得配置 */
  getConfig(): IBettingConfig {
    return this.config
  }

  /* 驗證下注 */
  validateBet(request: IBetRequest): IBetValidationResult {
    const { playerSummary, bracket, betPercentOfAssets } = request

    // 檢查區間是否有效
    const bracketConfig = getBracketConfig(bracket, this.config)
    if (!bracketConfig) {
      return {
        isValid: false,
        error: `無效的下注區間: ${bracket}`,
      }
    }

    // 檢查下注百分比是否在範圍內
    if (
      betPercentOfAssets < this.config.minBetPercentOfAssets ||
      betPercentOfAssets > this.config.maxBetPercentOfAssets
    ) {
      return {
        isValid: false,
        error: `下注百分比必須在 ${this.config.minBetPercentOfAssets * 100}% 至 ${this.config.maxBetPercentOfAssets * 100}% 之間`,
      }
    }

    // 計算實際下注金額
    const actualBetAmount = Math.floor(playerSummary.totalAssets * betPercentOfAssets)

    // 檢查玩家是否有足夠金幣
    if (actualBetAmount > playerSummary.availableGold) {
      return {
        isValid: false,
        error: `可用金幣不足: 需要 ${actualBetAmount}，但只有 ${playerSummary.availableGold}`,
      }
    }

    return {
      isValid: true,
      actualBetAmount,
    }
  }

  /* 下注 */
  placeBet(request: IBetRequest): ICombatBettingResult {
    const validation = this.validateBet(request)
    if (!validation.isValid || !validation.actualBetAmount) {
      throw new Error(`下注失敗: ${validation.error}`)
    }

    const bracketConfig = getBracketConfig(request.bracket, this.config)!
    const betAmount = validation.actualBetAmount

    return {
      bracket: request.bracket,
      betAmount,
      multiplier: bracketConfig.multiplier,
      potentialPayout: betAmount * bracketConfig.multiplier,
      placedAt: Date.now(),
    }
  }

  /* 結算下注 */
  settleBet(request: IBetSettlementRequest): IBetSettlementResult {
    const { bettingResult, actualHealthPercent } = request

    // 判斷實際血量落在哪個區間
    const actualBracket = determineBracket(actualHealthPercent, this.config)

    // 判斷是否猜中
    const isWin = actualBracket === bettingResult.bracket

    let payoutAmount: number
    if (isWin) {
      // 猜中，獲得完整賠付
      payoutAmount = bettingResult.potentialPayout
    } else {
      // 猜錯，僅獲得基礎獎勵
      payoutAmount = this.config.baseReward
    }

    const netProfit = payoutAmount - bettingResult.betAmount

    return {
      isWin,
      payoutAmount,
      netProfit,
    }
  }
}
