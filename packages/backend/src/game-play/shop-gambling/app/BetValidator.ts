import type { IBetValidator, IBetRequest, IPlayerAssets, IBetValidationResult } from '../interfaces'

/**
 * 下注驗證器實作
 */
export class BetValidator implements IBetValidator {
  private minBetPercent: number
  private maxBetPercent: number
  private maxBetAmount?: number

  constructor(minBetPercent = 0.001, maxBetPercent = 0.1, maxBetAmount?: number) {
    this.minBetPercent = minBetPercent
    this.maxBetPercent = maxBetPercent
    this.maxBetAmount = maxBetAmount
  }

  /* 驗證下注請求 */
  validate(betRequest: IBetRequest, playerAssets: IPlayerAssets): IBetValidationResult {
    const warnings: string[] = []

    // 檢查下注金額是否為正數
    if (betRequest.betAmount <= 0) {
      return {
        isValid: false,
        error: '下注金額必須大於 0',
      }
    }

    // 檢查玩家是否有足夠金幣
    if (betRequest.betAmount > playerAssets.availableGold) {
      return {
        isValid: false,
        error: `可用金幣不足: 需要 ${betRequest.betAmount}，但只有 ${playerAssets.availableGold}`,
      }
    }

    // 計算下注百分比
    const betPercent = betRequest.betAmount / playerAssets.totalAssets

    // 檢查最小下注百分比
    if (betPercent < this.minBetPercent) {
      return {
        isValid: false,
        error: `下注金額過低: 最少需要 ${Math.ceil(playerAssets.totalAssets * this.minBetPercent)} (總資產的 ${this.minBetPercent * 100}%)`,
      }
    }

    // 檢查最大下注百分比
    if (betPercent > this.maxBetPercent) {
      return {
        isValid: false,
        error: `下注金額過高: 最多只能 ${Math.floor(playerAssets.totalAssets * this.maxBetPercent)} (總資產的 ${this.maxBetPercent * 100}%)`,
      }
    }

    // 檢查絕對上限
    if (this.maxBetAmount && betRequest.betAmount > this.maxBetAmount) {
      return {
        isValid: false,
        error: `下注金額超過上限: 最多只能 ${this.maxBetAmount}`,
      }
    }

    // 警告：下注金額超過總資產的 5%
    if (betPercent > 0.05) {
      warnings.push(`注意：下注金額為總資產的 ${(betPercent * 100).toFixed(1)}%`)
    }

    return {
      isValid: true,
      warnings: warnings.length > 0 ? warnings : undefined,
    }
  }
}
