import type { HealthBracket } from './ICombatBettingResult'

/**
 * 下注區間配置
 */
export interface IBracketConfig {
  /** 血量區間 */
  bracket: HealthBracket
  /** 賠率倍數 */
  multiplier: number
  /** 最小血量百分比 */
  minHealthPercent: number
  /** 最大血量百分比 */
  maxHealthPercent: number
}

/**
 * 下注配置
 */
export interface IBettingConfig {
  /** 區間定義列表 */
  brackets: IBracketConfig[]
  /** 最小下注金額（基於玩家總資產的百分比，0.01 = 1%） */
  minBetPercentOfAssets: number
  /** 最大下注金額（基於玩家總資產的百分比，1.0 = 100%） */
  maxBetPercentOfAssets: number
  /** 基礎獎勵（未下注或猜錯時的保底獎勵） */
  baseReward: number
}
