import type { CombatLogEntry } from './CombatLogEntry'
/**
 * IEventLogger
 *
 * 事件日誌記錄器介面
 * 負責記錄戰鬥事件並提供查詢功能
 */
export interface IEventLogger {
  /** 記錄一個日誌條目 */
  log(entry: CombatLogEntry): void
  /** 獲取所有日誌 */
  getLogs(): readonly CombatLogEntry[]
  /** 清除所有日誌 */
  clear(): void
  /** 根據 tick 範圍獲取日誌 */
  getLogsByTickRange(startTick: number, endTick: number): CombatLogEntry[]
}
