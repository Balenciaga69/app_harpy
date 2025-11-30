import type { ICharacter } from '../../character'
import type { CombatLogEntry } from '../../logger'
import type { CombatOutcome } from './combat.outcome'
import type { CombatSnapshot } from './combat.snapshot'
import type { CombatStatistics } from './combat.statistics'

/**
 * 戰鬥結果
 *
 * 包含完整的戰鬥過程和結果數據，供 UI 回放使用。
 * 使用組合模式將不同職責的數據結構組合在一起。
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
  /** 完整的事件日誌（用於詳細回放） */
  logs: CombatLogEntry[]
  /** 定期快照（用於快速跳轉） */
  snapshots: CombatSnapshot[]
  /** 統計數據 */
  statistics: CombatStatistics
  /** 戰鬥開始時間戳 */
  startedAt: number
  /** 戰鬥結束時間戳 */
  endedAt: number
}
