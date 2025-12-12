import type { ICombatEventBus } from '../../interfaces/event-bus/ICombatEventBus'
import type { CombatLogEntry } from '../../interfaces/logger/CombatLogEntry'
/**
 * EventLogger
 *
 * Records combat events from EventBus, tracks tick context, and provides log query methods. Supports filtering
 * by tick range and extracting common fields from event payloads.
 */
export class EventLogger {
  private logs: CombatLogEntry[] = []
  private eventBus: ICombatEventBus
  private currentTick: number = 0
  constructor(eventBus: ICombatEventBus) {
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
  /** Set up event listeners */
  private setupListeners() {
    // 1. Track Tick
    this.eventBus.on('tick:start', (payload) => {
      this.currentTick = payload.tick
    })
    // 2. Record all events
    this.eventBus.onAll((type, payload) => {
      const entry: CombatLogEntry = {
        tick: this.currentTick,
        eventType: type,
        payload: payload as Record<string, unknown>,
      }
      // Try to extract common fields from payload
      if (payload && typeof payload === 'object') {
        const p = payload as Record<string, unknown>
        if ('sourceId' in p && typeof p.sourceId === 'string') entry.sourceId = p.sourceId
        if ('targetId' in p && typeof p.targetId === 'string') entry.targetId = p.targetId
      }
      this.log(entry)
    })
  }
}
