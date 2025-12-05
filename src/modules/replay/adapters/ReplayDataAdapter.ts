import type { CombatResult, CombatSnapshot, CombatLogEntry } from '../../combat'
/**
 * ReplayDataAdapter
 *
 * Adapter for converting Combat module data to Replay module format.
 * Isolates Combat module dependencies from the rest of Replay system.
 *
 * Purpose:
 * - Centralize Combat module dependencies in one place
 * - Provide optimized snapshot lookup with binary search
 * - Validate combat result data integrity on load
 * - Abstract combat data access for replay engine
 *
 * Responsibilities:
 * - Load and validate CombatResult
 * - Build snapshot index for O(log n) lookup
 * - Provide snapshot query at specific tick
 * - Provide log query in tick ranges
 *
 * Implementation notes:
 * - Snapshots are sorted by tick (guaranteed by combat engine)
 * - Uses binary search for efficient snapshot lookup
 * - Immutable data (never modifies combat result)
 */
export class ReplayDataAdapter {
  private snapshots: CombatSnapshot[] = []
  private logs: CombatLogEntry[] = []
  private totalTicks: number = 0
  /** Load and validate combat result data */
  public load(result: CombatResult): void {
    if (!result?.snapshots || !result?.logs) {
      throw new Error('Invalid combat result: missing snapshots or logs')
    }
    if (result.snapshots.length === 0) {
      throw new Error('Invalid combat result: snapshots array is empty')
    }
    this.snapshots = result.snapshots
    this.logs = result.logs
    this.calculateTotalTicks()
  }
  /** Get snapshot at or before specific tick (O(log n) lookup) */
  public getSnapshotAtTick(tick: number): CombatSnapshot | null {
    if (this.snapshots.length === 0) {
      return null
    }
    // Binary search for closest snapshot at or before tick
    let left = 0
    let right = this.snapshots.length - 1
    let result: CombatSnapshot | null = null
    while (left <= right) {
      const mid = Math.floor((left + right) / 2)
      const snapshot = this.snapshots[mid]
      if (snapshot.tick <= tick) {
        result = snapshot
        left = mid + 1
      } else {
        right = mid - 1
      }
    }
    return result
  }
  /** Get logs in tick range */
  public getLogsInRange(startTick: number, endTick: number): CombatLogEntry[] {
    return this.logs.filter((log) => log.tick >= startTick && log.tick <= endTick)
  }
  /** Get logs at exact tick */
  public getLogsAtTick(tick: number): CombatLogEntry[] {
    return this.logs.filter((log) => log.tick === tick)
  }
  /** Get all logs for services */
  public getAllLogs(): readonly CombatLogEntry[] {
    return this.logs
  }
  /** Get total ticks in combat */
  public getTotalTicks(): number {
    return this.totalTicks
  }
  /** Check if data is loaded */
  public isLoaded(): boolean {
    return this.snapshots.length > 0
  }
  /** Clear all data */
  public clear(): void {
    this.snapshots = []
    this.logs = []
    this.totalTicks = 0
  }
  // === Private methods ===
  /** Calculate total ticks from combat result */
  private calculateTotalTicks(): void {
    if (this.snapshots.length === 0) {
      this.totalTicks = 0
      return
    }
    const lastSnapshot = this.snapshots[this.snapshots.length - 1]
    this.totalTicks = lastSnapshot.tick
  }
}
