import type { ReplayEvent, ReplayEventType } from '../../models'
/**
 * IEventBus
 *
 * Event emitter abstraction for replay system.
 * Decouples replay engine from specific event library implementation.
 *
 * Purpose:
 * - Provide type-safe event emission and subscription
 * - Enable dependency inversion (replay depends on abstraction, not concrete implementation)
 * - Allow easy testing with mock event emitter
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
