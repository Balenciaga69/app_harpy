import type { ICombatBettingResult, HealthBracket } from './ICombatBettingResult'
import type { IBettingConfig } from './IBettingConfig'
import type { IPlayerSummary } from './IPlayerSummary'

/**
 * 下注請求
 */
export interface IBetRequest {
  /** 玩家摘要 */
  playerSummary: IPlayerSummary
  /** 下注的血量區間 */
  bracket: HealthBracket
  /** 下注金額百分比（相對總資產，0.01 = 1%） */
  betPercentOfAssets: number
}

/**
 * 下注驗證結果
 */
export interface IBetValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 錯誤訊息（若無效） */
  error?: string
  /** 計算後的實際下注金額 */
  actualBetAmount?: number
}

/**
 * 下注結算請求
 */
export interface IBetSettlementRequest {
  /** 下注結果 */
  bettingResult: ICombatBettingResult
  /** 實際剩餘血量百分比（0-100） */
  actualHealthPercent: number
  /** 玩家摘要 */
  playerSummary: IPlayerSummary
}

/**
 * 下注結算結果
 */
export interface IBetSettlementResult {
  /** 是否猜中 */
  isWin: boolean
  /** 實際賠付金額 */
  payoutAmount: number
  /** 玩家獲得的淨收益（payout - betAmount） */
  netProfit: number
}

/**
 * 下注服務介面
 *
 * 處理下注驗證、賠率計算與結算
 */
export interface IBettingService {
  /**
   * 取得下注配置
   */
  getConfig(): IBettingConfig

  /**
   * 驗證下注請求
   * @param request 下注請求
   * @returns 驗證結果
   */
  validateBet(request: IBetRequest): IBetValidationResult

  /**
   * 下注
   * @param request 下注請求
   * @returns 下注結果
   */
  placeBet(request: IBetRequest): ICombatBettingResult

  /**
   * 結算下注
   * @param request 結算請求
   * @returns 結算結果
   */
  settleBet(request: IBetSettlementRequest): IBetSettlementResult
}
