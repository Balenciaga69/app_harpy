import type { CombatResult, CombatSnapshot, CombatLogEntry } from '../../combat'
import { ReplayError } from './ReplayError'
export class ReplayDataAdapter {
  private snapshots: CombatSnapshot[] = []
  private logs: CombatLogEntry[] = []
  private totalTicks: number = 0
  /** Load and validate combat result data */
  public load(result: CombatResult): void {
    if (!result?.snapshots || !result?.logs) {
      throw new ReplayError('Invalid combat result: missing snapshots or logs', 'INVALID_DATA', {
        hasSnapshots: !!result?.snapshots,
        hasLogs: !!result?.logs,
      })
    }
    if (result.snapshots.length === 0) {
      throw new ReplayError('Invalid combat result: snapshots array is empty', 'INVALID_DATA', {
        snapshotsLength: 0,
      })
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
