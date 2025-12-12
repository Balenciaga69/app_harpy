import mitt, { type Emitter } from 'mitt'
import type { IEventBus } from '../../shared/event-bus/IEventBus'
import type { ReplayEvent, ReplayEventType } from '../interfaces/ReplayEvent'
import type { IReplayEventBus } from '../interfaces/IReplayEventBus'

/**
 * ReplayEventBus
 *
 * Replay event bus implementation using mitt.
 * Implements the shared IEventBus and provides tick-aware convenience methods.
 */
export class ReplayEventBus implements IReplayEventBus {
  private emitter: Emitter<Record<ReplayEventType, ReplayEvent>>

  constructor() {
    this.emitter = mitt<Record<ReplayEventType, ReplayEvent>>()
  }

  /** Emit event (from IEventBus) */
  public emit<K extends ReplayEventType>(event: K, payload: ReplayEvent): void {
    this.emitter.emit(event, payload)
  }

  /** Emit event with tick context (convenience method) */
  public emitWithTick(eventType: ReplayEventType, tick: number, payload?: unknown): void {
    const event: ReplayEvent = {
      type: eventType,
      tick,
      payload,
      timestamp: Date.now(),
    }
    this.emitter.emit(eventType, event)
  }

  /** Subscribe to event type */
  public on<K extends ReplayEventType>(event: K, handler: (payload: ReplayEvent) => void): void {
    this.emitter.on(event, handler)
  }

  /** Unsubscribe from event type */
  public off<K extends ReplayEventType>(event: K, handler: (payload: ReplayEvent) => void): void {
    this.emitter.off(event, handler)
  }

  /** Clear all listeners */
  public clear(): void {
    this.emitter.all.clear()
  }
}
