import type { CharacterSnapshot, CharacterId, ICharacter } from '../../character'
import type { ElementalDamages } from '../../damage'
import type { CombatLogEntry } from '../../logger'
/**
 * 戰鬥結果類型
 */
export type CombatOutcome = 'player-win' | 'enemy-win' | 'draw' | 'timeout'
/**
 * 戰鬥快照
 * 記錄某個 Tick 時的完整戰鬥狀態
 */
export interface CombatSnapshot {
  /** 快照時間點 */
  tick: number
  /** 所有角色的狀態 */
  characters: CharacterSnapshot[]
}
/**
 * 關鍵時刻
 * 用於 UI 高亮/快速跳轉
 */
export interface KeyMoment {
  /** 發生時間點 */
  tick: number
  /** 事件類型 */
  type: 'first-blood' | 'character-death' | 'critical-hit' | 'comeback' | 'battle-start' | 'battle-end'
  /** 描述 */
  description: string
  /** 相關角色 */
  characterIds: CharacterId[]
}
/**
 * 角色戰鬥統計
 */
export interface CharacterStats {
  /** 角色 ID */
  characterId: CharacterId
  /** 角色名稱 */
  name: string
  /** 造成的總傷害 */
  damageDealt: number
  /** 受到的總傷害 */
  damageTaken: number
  /** 各元素傷害分布 (造成的) */
  elementalDamageDealt: ElementalDamages
  /** 各元素傷害分布 (受到的) */
  elementalDamageTaken: ElementalDamages
  /** 擊殺數 */
  kills: number
  /** 是否存活 */
  survived: boolean
  /** 攻擊次數 */
  attackCount: number
  /** 暴擊次數 */
  criticalHits: number
  /** 閃避次數 */
  dodges: number
}
/**
 * 戰鬥統計數據
 */
export interface CombatStatistics {
  /** 每個角色的統計 */
  characterStats: Map<CharacterId, CharacterStats>
  /** 效果觸發統計 */
  effectsApplied: Map<string, number> // effectName -> count
  /** 總傷害 */
  totalDamage: number
  /** 戰鬥時長 */
  duration: number
}
/**
 * 戰鬥結果
 * 包含完整的戰鬥過程和結果數據,供 UI 回放使用
 */
export interface CombatResult {
  /** 戰鬥結果 */
  outcome: CombatOutcome
  /** 獲勝方 */
  winner: 'player' | 'enemy' | null
  /** 存活者 */
  survivors: ICharacter[]
  /** 戰鬥總 Tick 數 */
  totalTicks: number
  /** 完整的事件日誌 (用於詳細回放) */
  logs: CombatLogEntry[]
  /** 定期快照 (用於快速跳轉) */
  snapshots: CombatSnapshot[]
  /** 關鍵時刻 (用於高亮) */
  keyMoments: KeyMoment[]
  /** 統計數據 */
  statistics: CombatStatistics
  /** 戰鬥開始時間戳 */
  startedAt: number
  /** 戰鬥結束時間戳 */
  endedAt: number
}
