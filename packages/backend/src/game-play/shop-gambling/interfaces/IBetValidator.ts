import type { IBetRequest } from './IBetRequest'

/**
 * 玩家資產資訊
 */
export interface IPlayerAssets {
  /** 玩家 ID */
  playerId: string
  /** 總資產 */
  totalAssets: number
  /** 可用金幣 */
  availableGold: number
}

/**
 * 下注驗證結果
 */
export interface IBetValidationResult {
  /** 是否有效 */
  isValid: boolean
  /** 錯誤訊息（若無效） */
  error?: string
  /** 警告訊息 */
  warnings?: string[]
}

/**
 * 下注驗證器介面
 */
export interface IBetValidator {
  /**
   * 驗證下注請求
   * @param betRequest 下注請求
   * @param playerAssets 玩家資產
   * @returns 驗證結果
   */
  validate(betRequest: IBetRequest, playerAssets: IPlayerAssets): IBetValidationResult
}
