import type { EventBus } from '../event/EventBus'
import type { CombatLogEntry } from './combatLog.model'
export class EventLogger {
  private logs: CombatLogEntry[] = []
  private eventBus: EventBus
  private currentTick: number = 0
  constructor(eventBus: EventBus) {
    this.eventBus = eventBus
    this.setupListeners()
  }
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
  /** 設置事件監聽器 */
  private setupListeners() {
    // 1. 追蹤 Tick
    this.eventBus.on('tick:start', (payload) => {
      this.currentTick = payload.tick
    })
    // 2. 記錄所有事件
    this.eventBus.onAll((type, payload) => {
      const entry: CombatLogEntry = {
        tick: this.currentTick,
        eventType: type,
        payload: payload as Record<string, unknown>,
      }
      // 嘗試從 payload 中提取常見欄位
      if (payload && typeof payload === 'object') {
        const p = payload as Record<string, unknown>
        if ('sourceId' in p && typeof p.sourceId === 'string') entry.sourceId = p.sourceId
        if ('targetId' in p && typeof p.targetId === 'string') entry.targetId = p.targetId
      }
      this.log(entry)
    })
  }
}
