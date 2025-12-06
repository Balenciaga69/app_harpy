import type { ReplayEvent, ReplayEventType } from '../../models'

/**
 * Replay Event Bus Interface
 *
 * Specialized event bus for replay module with tick-aware emit signature.
 * Different from the generic IEventBus due to replay-specific requirements.
 */
export interface IReplayEventBus {
  /** Emit event with tick context */
  emit(eventType: ReplayEventType, tick: number, payload?: unknown): void
  /** Subscribe to event type */
  on(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void
  /** Unsubscribe from event type */
  off(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void
  /** Clear all listeners */
  clear(): void
}
