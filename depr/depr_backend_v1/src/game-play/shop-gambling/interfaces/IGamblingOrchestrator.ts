import type { IBetRequest } from './IBetRequest'
import type { IGamblingResult } from './IGamblingResult'
import type { IPlayerAssets } from './IBetValidator'
import type { IGamblingConfig } from './IGamblingConfig'

/**
 * 賭博編排器介面
 */
export interface IGamblingOrchestrator {
  /**
   * 執行下注
   * @param betRequest 下注請求
   * @param playerAssets 玩家資產
   * @param config 賭博配置（選用，使用預設配置）
   * @returns 賭博結果
   */
  placeBet(betRequest: IBetRequest, playerAssets: IPlayerAssets, config?: IGamblingConfig): Promise<IGamblingResult>

  /**
   * 取得預設配置
   */
  getDefaultConfig(): IGamblingConfig
}
