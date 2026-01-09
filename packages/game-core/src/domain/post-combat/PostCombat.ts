import { ItemRecord } from '../item/Item'
export type CombatRewardType =
  | 'HIGH_RARITY_RELIC'
  | 'HIGH_AFFINITY'
  | 'LOW_AFFINITY'
  | 'GOLD'
  | 'BOSS_REWARD'
  | 'ELITE_REWARD'
export interface CombatReward {
  readonly type: CombatRewardType
  readonly itemRecords: ReadonlyArray<ItemRecord>
  readonly gold: number
}
export interface CombatWinDetail {
  readonly selectedRewardIndexes: number[]
  readonly maxSelectableCount: number
  readonly availableRewards: ReadonlyArray<CombatReward>
}
export interface CombatLoseDetail {
  readonly retryCountToDeduct: number
}
export type CombatDifficultyType = 'NORMAL' | 'ELITE' | 'BOSS' | 'ENDLESS'
export interface PostCombatSharedContext {
  readonly isPlayerConfirmed: boolean
  readonly combatDifficulty: CombatDifficultyType
}
export type PostCombatWinContext = {
  readonly result: 'WIN'
  readonly detail: CombatWinDetail
} & PostCombatSharedContext
export type PostCombatLoseContext = {
  readonly result: 'LOSE'
  readonly detail: CombatLoseDetail
} & PostCombatSharedContext
export type PostCombatContext = PostCombatWinContext | PostCombatLoseContext
