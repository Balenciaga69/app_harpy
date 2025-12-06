import type { RunEventMap } from '../../models'
/**
 * Run Event Bus interface
 *
 * Type-safe event bus for Run module communication.
 * Handlers subscribe to events, RunEngine emits events.
 */
export interface IRunEventBus {
  /** Subscribe to an event */
  on<K extends keyof RunEventMap>(event: K, handler: (payload: RunEventMap[K]) => void): void
  /** Unsubscribe from an event */
  off<K extends keyof RunEventMap>(event: K, handler: (payload: RunEventMap[K]) => void): void
  /** Emit an event to all subscribers */
  emit<K extends keyof RunEventMap>(event: K, payload: RunEventMap[K]): void
  /** Clear all subscriptions */
  clear(): void
}
