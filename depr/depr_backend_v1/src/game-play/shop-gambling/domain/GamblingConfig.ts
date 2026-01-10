import type { IGamblingConfig } from '../interfaces'
import { GameMode } from '../interfaces'

/**
 * 預設拉霸機配置
 */
export const DEFAULT_SLOT_CONFIG: IGamblingConfig = {
  gameMode: GameMode.SLOT,
  minBetPercent: 0.001, // 0.1%
  maxBetPercent: 0.1, // 10%
  maxBetAmount: 10000,
  houseEdgeTarget: 0.05, // 5%
  payoutTable: [
    { condition: 'three_7s', multiplier: 100, probability: 0.001 },
    { condition: 'three_bars', multiplier: 50, probability: 0.005 },
    { condition: 'three_cherries', multiplier: 20, probability: 0.01 },
    { condition: 'three_lemons', multiplier: 10, probability: 0.02 },
    { condition: 'three_oranges', multiplier: 10, probability: 0.02 },
    { condition: 'three_plums', multiplier: 10, probability: 0.02 },
    { condition: 'two_cherries', multiplier: 5, probability: 0.05 },
    { condition: 'one_cherry', multiplier: 2, probability: 0.1 },
  ],
}

/**
 * 預設固定賠率配置
 */
export const DEFAULT_FIXED_ODDS_CONFIG: IGamblingConfig = {
  gameMode: GameMode.FIXED_ODDS,
  minBetPercent: 0.001,
  maxBetPercent: 0.1,
  maxBetAmount: 10000,
  houseEdgeTarget: 0.05,
  payoutTable: [
    { condition: 'high_risk', multiplier: 5, probability: 0.18 },
    { condition: 'medium_risk', multiplier: 3, probability: 0.3 },
    { condition: 'low_risk', multiplier: 1.5, probability: 0.6 },
  ],
}
