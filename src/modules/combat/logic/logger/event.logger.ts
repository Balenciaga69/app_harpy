import type { EventBus } from '../../infra/event-bus'
import type { CombatLogEntry } from './combat.log.model'
/**
 * EventLogger: Combat event recording and query system.
 *
 * Design concept:
 * - As implementation of observer pattern, listens to all events from EventBus and records them.
 * - Provides timeline query functionality, supports filtering logs by Tick range.
 * - Automatically tracks current Tick, ensures each log has correct timestamp.
 * - Achieves loose coupling through event-driven approach, no need to modify business logic for logging.
 *
 * Main responsibilities:
 * - Listens to all combat events, automatically records to log list.
 * - Tracks current Tick, adds time context to each log.
 * - Provides log query interface, supports full and range queries.
 * - Automatically extracts common fields (like sourceId, targetId) from event payload.
 */
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
  /** Set up event listeners */
  // TODO: This part is not rigorous enough, blindly destructures events, and listens to all events, can be changed in the future to only listen to specific events
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
