import type { CombatLogEntry } from './combatLog.model'
export class EventLogger {
  private logs: CombatLogEntry[] = []
  log(entry: CombatLogEntry): void {
    this.logs.push(entry)
  }
  getLogs(): readonly CombatLogEntry[] {
    return this.logs
  }
  clear(): void {
    this.logs = []
  }
  getLogsByTickRange(startTick: number, endTick: number): CombatLogEntry[] {
    return this.logs.filter((log) => log.tick >= startTick && log.tick <= endTick)
  }
}
