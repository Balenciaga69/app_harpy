import type { EventBus } from '../../infra/event-bus'
import type { CombatLogEntry } from './combat.log.model'
/**
 * EventLogger：戰鬥事件的記錄與查詢系統。
 *
 * 設計理念：
 * - 作為觀察者模式的實現，監聽 EventBus 的所有事件並記錄。
 * - 提供時間軸查詢功能，支援按 Tick 範圍篩選日誌。
 * - 自動追蹤當前 Tick，確保每條日誌都有正確的時間戳記。
 * - 通過事件驅動實現鬆耦合，無需修改業務邏輯即可完成日誌記錄。
 *
 * 主要職責：
 * - 監聽所有戰鬥事件，自動記錄到日誌列表中。
 * - 追蹤當前 Tick，為每條日誌添加時間上下文。
 * - 提供日誌查詢介面，支援全量與範圍查詢。
 * - 自動從事件 payload 中提取常見欄位（如 sourceId、targetId）。
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
  /** 設置事件監聽器 */
  // TODO: 這一段其實不夠嚴謹，盲拆事件，而且全部事件都監聽了，未來可以改成只監聽特定事件
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
