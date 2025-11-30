import type { ICharacter } from '../../character'
import type { CombatLogEntry } from '../../logger'
import type { CombatOutcome } from './combat.outcome.model'
import type { CombatSnapshot } from './combat.snapshot.model'
import type { CombatStatistics } from './combat.statistics.model'
/**
 * 戰鬥結果
 *
 * 負責封裝完整的戰鬥過程與結果，主要用於 UI 回放。
 * 使用組合模式將相關職責聚合在一起，方便維護與擴展。
 */
export interface CombatResult {
  /** 戰鬥結果 */
  outcome: CombatOutcome
  /** 勝利者 */
  winner: 'player' | 'enemy' | null
  /** 存活角色 */
  survivors: ICharacter[]
  /** 戰鬥 Tick 數 */
  totalTicks: number
  /** 完整事件日誌，供詳細回放使用 */
  logs: CombatLogEntry[]
  /** 定期快照（用於快速跳轉） */
  snapshots: CombatSnapshot[]
  /** 統計數據 */
  statistics: CombatStatistics
  /** 戰鬥開始 tick */
  startedAt: number
  /** 戰鬥結束 tick */
  endedAt: number
}
