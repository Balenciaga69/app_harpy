import type { CombatSnapshot } from './CombatSnapshot'

/**
 * 快照收集器介面
 *
 * 負責定期收集戰鬥快照
 */
export interface ISnapshotCollector {
  /** 獲取所有收集的快照 */
  getSnapshots(): CombatSnapshot[]

  /** 清理資源 */
  dispose(): void
}
