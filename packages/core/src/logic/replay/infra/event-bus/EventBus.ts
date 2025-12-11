import mitt, { type Emitter } from 'mitt'
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
/**
 * ReplayEventBus
 *
 * Replay event bus implementation using mitt.
 * Wraps tick and payload into ReplayEvent format.
 */
export class ReplayEventBus implements IReplayEventBus {
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
}
