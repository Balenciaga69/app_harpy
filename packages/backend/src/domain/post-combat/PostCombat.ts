/*
接下來你要做 建立空檔案, 包含註解 但不要有任何實際程式碼, 滿足能"預備實現"藍圖:
- 獎勵不同類型 會有不同的生成策略
親合度代表著 character 穿戴在身上遺物群們 統計下來某個 tag 的重複出現次數越高, 代表這個 character 越喜歡這個 tag

*/

import { ItemRecord } from '../item/Item'
/**
 * 獎勵類型
 * 包含: 高稀有度遺物、高親合度遺物、低親合度遺物、金幣、頭目擊殺獎勵
 */
export type CombatRewardType = 'HIGH_RARITY_RELIC' | 'HIGH_AFFINITY' | 'LOW_AFFINITY' | 'GOLD' | 'BOSS_REWARD'
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
