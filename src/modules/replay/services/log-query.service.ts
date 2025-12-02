import type { CombatLogEntry } from '../../combat/logic/logger'
/**
 * LogQueryService
 *
 * Centralized service for querying and filtering combat logs.
 * Eliminates code duplication across controllers and provides reusable query methods.
 */
export class LogQueryService {
  private logs: ReadonlyArray<CombatLogEntry>
  constructor(logs: ReadonlyArray<CombatLogEntry>) {
    this.logs = logs
  }
  /** Update logs reference (when new combat result is loaded) */
  public updateLogs(logs: ReadonlyArray<CombatLogEntry>): void {
    this.logs = logs
  }
  /** Get logs within tick range (inclusive) */
  public getLogsInRange(startTick: number, endTick: number): CombatLogEntry[] {
    return this.logs.filter((log) => log.tick >= startTick && log.tick <= endTick)
  }
  /** Get logs at specific tick */
  public getLogsAtTick(tick: number): CombatLogEntry[] {
    return this.logs.filter((log) => log.tick === tick)
  }
  /** Get all ticks where ultimates were cast */
  public getUltimateTicks(): number[] {
    return this.logs
      .filter((log) => this.isUltimateEvent(log))
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Get all ticks where deaths occurred */
  public getDeathTicks(): number[] {
    return this.logs
      .filter((log) => log.eventType === 'entity:death')
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Get all ticks where critical hits occurred */
  public getCriticalTicks(): number[] {
    return this.logs
      .filter((log) => log.eventType === 'entity:critical')
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Get all ticks matching specific event type */
  public getTicksByEventType(eventType: string): number[] {
    return this.logs
      .filter((log) => log.eventType === eventType)
      .map((log) => log.tick)
      .sort((a, b) => a - b)
  }
  /** Find next tick with specific event type after given tick */
  public findNextEventTick(currentTick: number, eventType: string): number | null {
    const ticks = this.getTicksByEventType(eventType)
    const nextTick = ticks.find((tick) => tick > currentTick)
    return nextTick ?? null
  }
  /** Find previous tick with specific event type before given tick */
  public findPrevEventTick(currentTick: number, eventType: string): number | null {
    const ticks = this.getTicksByEventType(eventType)
    const prevTick = ticks.reverse().find((tick) => tick < currentTick)
    return prevTick ?? null
  }
  // === Private helper methods ===
  /** Check if log entry is an ultimate event */
  private isUltimateEvent(log: CombatLogEntry): boolean {
    return log.eventType === 'entity:attack' && (log.payload.isUltimate as boolean) === true
  }
}
