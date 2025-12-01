import type { ReplayEvent, ReplayEventType } from '../models'
/**
 * Simple EventEmitter for replay events
 *
 * Provides basic pub/sub pattern for replay engine to communicate with UI.
 * Lightweight implementation without external dependencies.
 */
export class ReplayEventEmitter {
  private listeners: Map<ReplayEventType, Set<(event: ReplayEvent) => void>> = new Map()
  /** Subscribe to specific event type */
  public on(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(handler)
  }
  /** Unsubscribe from specific event type */
  public off(eventType: ReplayEventType, handler: (event: ReplayEvent) => void): void {
    const handlers = this.listeners.get(eventType)
    if (handlers) {
      handlers.delete(handler)
    }
  }
  /** Emit event to all subscribers */
  public emit(eventType: ReplayEventType, tick: number, payload?: unknown): void {
    const event: ReplayEvent = {
      type: eventType,
      tick,
      payload,
      timestamp: Date.now(),
    }
    const handlers = this.listeners.get(eventType)
    if (handlers) {
      handlers.forEach((handler) => handler(event))
    }
  }
  /** Clear all listeners (for cleanup) */
  public clear(): void {
    this.listeners.clear()
  }
  /** Get number of listeners for specific event type */
  public listenerCount(eventType: ReplayEventType): number {
    return this.listeners.get(eventType)?.size ?? 0
  }
}
