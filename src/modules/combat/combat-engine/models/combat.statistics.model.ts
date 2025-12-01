import type { CharacterId } from '../../domain/character'
/**
 * 角色戰鬥統計
 *
 * 記錄單個角色在戰鬥中的詳細數據。
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
 *
 * 彙總整場戰鬥的統計資訊。
 *
 * TODO: 統計計算邏輯
 * 目前統計數據為空殼，需要從 EventLogger 的日誌中反推計算。
 * 建議未來實現 StatisticsCalculator 類別，遍歷事件日誌並累積：
 * - damageDealt/damageTaken：監聽 'entity:damage' 事件
 * - kills：監聽 'entity:death' 事件
 * - criticalHits：監聽 'entity:critical' 事件
 * - dodges：監聽 'combat:miss' 事件
 * - effectsApplied：監聽 'entity:effect-applied' 事件
 */
export interface CombatStatistics {
  /** 每個角色的統計 */
  characterStats: Map<CharacterId, CharacterStats>
  /** 效果觸發統計 */
  effectsApplied: Map<string, number> // effectName -> count
  /** 總傷害 */
  totalDamage: number
  /** 戰鬥時長（Tick 數） */
  duration: number
}
