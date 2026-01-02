import { ItemRecord } from '../item/Item'
/**
 * 獎勵類型
 * 包含: 高稀有度遺物、高親合度遺物、低親合度遺物、金幣、頭目擊殺獎勵、精英擊殺獎勵
 */
export type CombatRewardType =
  | 'HIGH_RARITY_RELIC'
  | 'HIGH_AFFINITY'
  | 'LOW_AFFINITY'
  | 'GOLD'
  | 'BOSS_REWARD'
  | 'ELITE_REWARD'
/**
 * 獎勵資料結構
 */
export interface CombatReward {
  readonly type: CombatRewardType
  readonly itemRecords: ReadonlyArray<ItemRecord>
  readonly gold: number
}
/**
 * 戰鬥勝利詳情
 */
export interface CombatWinDetail {
  readonly selectedRewardIndex: number
  readonly availableRewards: ReadonlyArray<CombatReward>
}
/**
 * 戰鬥失敗詳情
 */
export interface CombatLoseDetail {
  readonly retryCountToDeduct: number
}
/**
 * 賽後共用結果
 */
export type CombatDifficultyType = 'NORMAL' | 'ELITE' | 'BOSS' | 'ENDLESS'
export interface PostCombatSharedContext {
  readonly isPlayerConfirmed: boolean
  readonly combatDifficulty: CombatDifficultyType
}
/**
 * 戰鬥勝利結果
 */
export type PostCombatWinContext = {
  readonly result: 'WIN'
  readonly detail: CombatWinDetail
} & PostCombatSharedContext
/**
 * 戰鬥失敗結果
 */
export type PostCombatLoseContext = {
  readonly result: 'LOSE'
  readonly detail: CombatLoseDetail
} & PostCombatSharedContext
/**
 * 賽後記錄類型
 */
export type PostCombatContext = PostCombatWinContext | PostCombatLoseContext
