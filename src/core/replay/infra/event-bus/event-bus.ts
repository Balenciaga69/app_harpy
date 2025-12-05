import type { ReplayEvent, ReplayEventType } from '../../models'
/**
 * IEventBus
 *
 * 回放系統事件總線抽象介面。
 * 隔離 replay engine 與具體事件庫實作。
 *
 * 主要用途：
 * - 型別安全的事件發送與訂閱
 * - 依賴反轉（只依賴抽象）
 * - 測試方便，可用 mock emitter
 */
export interface IEventBus {
  /** Emit event with payload */
  emit(eventType: ReplayEventType, tick: number, payload?: unknown): void
  /** Subscribe to event type */
  on(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void
  /** Unsubscribe from event type */
  off(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void
  /** Clear all event listeners */
  clear(): void
  /** Get number of listeners for specific event type (for debugging/testing) */
  listenerCount(eventType: ReplayEventType): number
}
