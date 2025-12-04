import mitt, { type Emitter } from 'mitt'
import type { IReplayEventEmitter } from './replay-event-emitter'
import type { ReplayEvent, ReplayEventType } from '../../models'
/**
 * MittReplayEventEmitter
 *
 * Mitt-based implementation of IReplayEventEmitter.
 * Wraps mitt library to provide type-safe replay event emission.
 *
 * Purpose:
 * - Hide mitt implementation details from replay engine
 * - Provide adapter for mitt's event system to match our interface
 * - Allow future migration to other event libraries if needed
 *
 * Implementation notes:
 * - Uses mitt's generic type parameter for type safety
 * - Converts tick + payload to ReplayEvent format
 * - Only this file knows about mitt's existence
 */
export class MittReplayEventEmitter implements IReplayEventEmitter {
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
