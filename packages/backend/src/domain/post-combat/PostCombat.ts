import { ItemRecord } from '../item/Item'
/**
 * 獎勵類型
 * 包含: 高稀有度遺物、高親合度遺物、低親合度遺物、金幣
 */
export type CombatRewardType = 'HIGH_RARITY_RELIC' | 'HIGH_AFFINITY' | 'LOW_AFFINITY' | 'GOLD'
/**
 * 獎勵資料結構
 */
export interface CombatReward {
  type: CombatRewardType
  itemRecords: ItemRecord[]
  gold: number
}
/**
 * 戰鬥勝利詳情
 */
export interface CombatWinDetail {
  selectedRewardIndex: number
  availableRewards: CombatReward[]
}
/**
 * 戰鬥失敗詳情
 */
export interface CombatLoseDetail {
  retryCountToDeduct: number
}
/**
 * 賽後共用結果
 */
export interface PostCombatSharedContext {
  isPlayerConfirmed: boolean
  combatDifficulty: 'NORMAL' | 'ELITE' | 'BOSS' | 'ENDLESS'
}
/**
 * 戰鬥勝利結果
 */
export interface PostCombatWinRContext {
  readonly result: 'WIN'
  readonly detail: CombatWinDetail
}
/**
 * 戰鬥失敗結果
 */
export interface PostCombatLoseContext {
  readonly result: 'LOSE'
  readonly detail: CombatLoseDetail
}
/**
 * 賽後記錄類型
 */
export type PostCombatContext = PostCombatWinRContext | PostCombatLoseContext | PostCombatSharedContext
