import type { IGamblingConfig } from './IGamblingConfig'
import type { IBetRequest } from './IBetRequest'
import type { ISlotOutcome } from './IGamblingResult'
import type { IRNGService } from './IRNGService'

/**
 * Reel 配置
 */
export interface IReelConfig {
  /** Reel ID */
  id: number
  /** 符號列表（符號 ID） */
  symbols: string[]
  /** 符號權重（選用，預設均等） */
  weights?: number[]
}

/**
 * Payline 配置
 */
export interface IPaylineConfig {
  /** Line ID */
  id: number
  /** Line 上的位置（每個 reel 的索引） */
  positions: number[]
}

/**
 * Slot 配置
 */
export interface ISlotConfig {
  /** Reel 配置列表 */
  reels: IReelConfig[]
  /** Payline 配置列表 */
  paylines: IPaylineConfig[]
  /** Wild 符號 ID 列表 */
  wildSymbols?: string[]
  /** Scatter 符號 ID 列表 */
  scatterSymbols?: string[]
}

/**
 * Slot 引擎介面
 */
export interface ISlotEngine {
  /**
   * 執行 spin
   * @param betRequest 下注請求
   * @param rng RNG 服務
   * @param config 賭博配置
   * @returns Slot 結果
   */
  spin(betRequest: IBetRequest, rng: IRNGService, config: IGamblingConfig): ISlotOutcome

  /**
   * 取得 Slot 配置
   */
  getSlotConfig(): ISlotConfig
}
