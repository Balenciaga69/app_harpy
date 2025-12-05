import mitt, { type Emitter } from 'mitt'
import type { IEventBus } from './event-bus'
import type { ReplayEvent, ReplayEventType } from '../../models'
/**
 * EventBus
 *
 * 基於 Mitt 的 IEventBus 實作。
 * 封裝 mitt 函式庫，提供型別安全的 replay 事件發送。
 *
 * 目的：
 * - 隱藏 mitt 的實作細節，讓 replay 引擎不需關心底層
 * - 提供 mitt 事件系統的介面轉接，符合我們的接口
 * - 未來如需更換事件函式庫，可輕鬆遷移
 *
 * 實作說明：
 * - 使用 mitt 的泛型參數確保型別安全
 * - 將 tick 和 payload 轉換為 ReplayEvent 格式
 * - 只有此檔案會引用 mitt
 */
export class EventBus implements IEventBus {
  private emitter: Emitter<Record<ReplayEventType, ReplayEvent>>
  constructor() {
    this.emitter = mitt<Record<ReplayEventType, ReplayEvent>>()
  }
  /** Emit event to all subscribers */
  public emit(eventType: ReplayEventType, tick: number, payload?: unknown): void {
    const event: ReplayEvent = {
      type: eventType,
      tick,
      payload,
      timestamp: Date.now(),
    }
    this.emitter.emit(eventType, event)
  }
  /** Subscribe to event type */
  public on(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    this.emitter.on(eventType, handler)
  }
  /** Unsubscribe from event type */
  public off(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    this.emitter.off(eventType, handler)
  }
  /** Clear all listeners */
  public clear(): void {
    this.emitter.all.clear()
  }
  /** Get listener count for debugging/testing */
  public listenerCount(eventType: ReplayEventType): number {
    const handlers = this.emitter.all.get(eventType)
    return handlers ? 1 : 0 // mitt doesn't expose handler count, simplified check
  }
}
