import type { IGamblingConfig } from './IGamblingConfig'
import type { IBetRequest } from './IBetRequest'
import type { IFixedOddsOutcome } from './IGamblingResult'
import type { IRNGService } from './IRNGService'

/**
 * 固定賠率選項
 */
export interface IFixedOddsOption {
  /** 選項 ID */
  id: string
  /** 選項描述 */
  description: string
  /** 勝率（0-1） */
  winProbability: number
  /** 賠率倍數 */
  multiplier: number
}

/**
 * 固定賠率引擎介面
 */
export interface IFixedOddsEngine {
  /**
   * 執行下注
   * @param betRequest 下注請求
   * @param rng RNG 服務
   * @param config 賭博配置
   * @returns 固定賠率結果
   */
  bet(betRequest: IBetRequest, rng: IRNGService, config: IGamblingConfig): IFixedOddsOutcome

  /**
   * 取得可用選項
   */
  getOptions(): IFixedOddsOption[]
}
